$dbPath = "\\172.16.0.49\Jaspion\data\jaspion.db"
$sqlitePath = "C:\Users\natan.massuia\.tools\sqlite3.exe"
$csvPath = "\\172.16.0.49\Jaspion\data\legacy_evaluations_import.csv"

Write-Host "Iniciando importação de checklists legados..."

# 1. Carregar lista ordenada de perguntas
$rawQuestions = & $sqlitePath $dbPath "SELECT q.id, b.name, q.text FROM cem_questions q JOIN cem_blocks b ON q.block_id = b.id ORDER BY b.order_index, q.order_index;"
$questionList = @()
foreach ($line in ($rawQuestions -split "`r?`n")) {
    if ($line -match '^([^\|]+)\|([^\|]+)\|(.+)$') {
        $questionList += [PSCustomObject]@{
            Id = $matches[1]
            Block = $matches[2]
            Text = $matches[3]
        }
    }
}

Write-Host "Perguntas carregadas: $($questionList.Count)"

function Normalize-Answer([string]$ans) {
    if (-not $ans) { return "na" }
    $clean = $ans.Trim().ToLower()
    if ($clean -like "*não conforme*" -or $clean -like "*nao conforme*") { return "nao-conforme" }
    if ($clean -like "*parcialmente conforme*") { return "parcialmente-conforme" }
    if ($clean -like "*conforme*") { return "conforme" }
    if ($clean -like "*não se aplica*" -or $clean -like "*nao se aplica*") { return "na" }
    return "na"
}

function Escape-Sql([string]$val) {
    if ($null -eq $val) { return "''" }
    return "'" + ($val -replace "'", "''") + "'"
}

# 2. Ler CSV
$csvData = Import-Csv -Path $csvPath -Delimiter ';' -Encoding UTF8
$ticketGroups = $csvData | Group-Object ticket

$allSql = New-Object System.Collections.Generic.List[string]
$allSql.Add("BEGIN TRANSACTION;")

foreach ($group in $ticketGroups) {
    $tId = $group.Name
    $rows = $group.Group
    $first = $rows[0]
    $evalDate = $first.data
    $score = [int]$first.conformidade
    $evalId = "eval_legacy_$tId"
    $createdAt = "${evalDate}T12:00:00.000Z"
    
    # Montar notas
    $revisaoMotivo = $first.motivo_revisao
    $precisaRevisao = $first.precisa_revisao
    $qualityObs = ($rows | Where-Object { $_.bloco -like "*Qualidade*" }).observacao

    $notesParts = @()
    if ($precisaRevisao -eq "Sim" -and $revisaoMotivo) {
        $notesParts += "[Revisão Necessária: $revisaoMotivo]"
    }
    if ($qualityObs) {
        $notesParts += $qualityObs
    }
    if ($notesParts.Count -eq 0) {
        $notesParts += "Importado do banco de dados legado"
    }
    $notes = $notesParts -join " | "

    $good = 0
    $bad = 0
    $fourth = 0
    $na = 0

    $allSql.Add("DELETE FROM cem_answers WHERE evaluation_id = '$evalId';")
    $allSql.Add("DELETE FROM cem_evaluations WHERE ticket_protocol = '$tId';")

    for ($i = 0; $i -lt $rows.Count; $i++) {
        $row = $rows[$i]
        $qMeta = $questionList[$i]
        $qId = $qMeta.Id
        $normAns = Normalize-Answer $row.resposta
        $obs = $row.observacao

        switch ($normAns) {
            "conforme" { $good++ }
            "nao-conforme" { $bad++ }
            "parcialmente-conforme" { $fourth++ }
            "na" { $na++ }
        }

        $ansId = "ans_${evalId}_${qId}"
        $ansSql = "INSERT INTO cem_answers (id, evaluation_id, question_id, answer, observation) VALUES (" +
            (Escape-Sql $ansId) + ", " +
            (Escape-Sql $evalId) + ", " +
            (Escape-Sql $qId) + ", " +
            (Escape-Sql $normAns) + ", " +
            (Escape-Sql $obs) + ");"
        $allSql.Add($ansSql)
    }

    $evalSql = "INSERT INTO cem_evaluations (id, ticket_protocol, evaluator_id, evaluator_name, evaluation_date, shift, score_percentage, good_count, bad_count, fourth_count, na_count, notes, created_at) VALUES (" +
        (Escape-Sql $evalId) + ", " +
        (Escape-Sql $tId) + ", " +
        "'usr_editor', 'Analista QA CCO', " +
        (Escape-Sql $evalDate) + ", 'Comercial', " +
        $score + ", " +
        $good + ", " +
        $bad + ", " +
        $fourth + ", " +
        $na + ", " +
        (Escape-Sql $notes) + ", " +
        (Escape-Sql $createdAt) + ");"
    $allSql.Add($evalSql)

    Write-Host "Preparado Ticket ${tId} - Score ${score}%, Conforme: $good, Nao conforme: $bad, Parcial: $fourth, NA: $na"
}

$allSql.Add("COMMIT;")

$sqlFile = "C:\Users\natan.massuia\.tools\execute_import.sql"
Set-Content -Path $sqlFile -Value ($allSql -join "`n") -Encoding UTF8

Write-Host "Executando carga no SQLite..."
& $sqlitePath $dbPath ".read '$($sqlFile -replace '\\', '/')'"

Write-Host "Importação concluída com sucesso!"

