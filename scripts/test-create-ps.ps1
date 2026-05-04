$env:APPWRITE_ENDPOINT = "https://tor.cloud.appwrite.io/v1"
$env:APPWRITE_PROJECT_ID = "69e8bc1500162d3defdb"
$env:APPWRITE_API_KEY = (Select-String -Path .env -Pattern "APPWRITE_API_KEY" | ForEach-Object { $_.Line.Split('=')[1] })
$databaseId = "69e90e4d00075469122c"
$collId = "testperm2"

$url = "$env:APPWRITE_ENDPOINT/databases/$databaseId/collections"
$body = @{
    collectionId = $collId
    name = "TestPerm2"
    read = @("role:all")
    write = @("role:users")
    documentSecurity = $false
} | ConvertTo-Json -Depth 3

Write-Host "POST $url"
Write-Host "Body: $body"

try {
    $resp = Invoke-RestMethod -Method Post -Uri $url -Headers @{
        'X-Appwrite-Project' = $env:APPWRITE_PROJECT_ID
        'X-Appwrite-Key' = $env:APPWRITE_API_KEY
        'Content-Type' = 'application/json'
    } -Body $body
    Write-Host "Created: $($resp.$id)"
    # Now GET it
    $getUrl = "$url/$($resp.$id)"
    $get = Invoke-RestMethod -Method Get -Uri $getUrl -Headers @{
        'X-Appwrite-Project' = $env:APPWRITE_PROJECT_ID
        'X-Appwrite-Key' = $env:APPWRITE_API_KEY
    }
    Write-Host "GET response:"
    $get | ConvertTo-Json -Depth 3 | Write-Host
    Write-Host "read:" $get.read
    Write-Host "write:" $get.write
    Write-Host "`$permissions:" ($get.$permissions -join ', ')
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.BaseStream.Position = 0
        $reader.DiscardBuffouredData()
        $body = $reader.ReadToEnd()
        Write-Host "Response body:" $body
    }
}
