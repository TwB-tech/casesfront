Import-Module -Name Microsoft.PowerShell.Utility

$env:APPWRITE_ENDPOINT = "https://tor.cloud.appwrite.io/v1"
$env:APPWRITE_PROJECT_ID = "69e8bc1500162d3defdb"
$env:APPWRITE_API_KEY = (Select-String -Path .env -Pattern "APPWRITE_API_KEY" | ForEach-Object { $_.Line.Split('=')[1] })
$databaseId = "69e90e4d00075469122c"
$collId = "testperm1777814181888"

$url = "$env:APPWRITE_ENDPOINT/databases/$databaseId/collections/$collId"

Write-Host "PATCH $url"
$body = @{ read = @('role:all'); write = @('role:users') } | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Method Patch -Uri $url -Headers @{
    'X-Appwrite-Project' = $env:APPWRITE_PROJECT_ID
    'X-Appwrite-Key' = $env:APPWRITE_API_KEY
    'Content-Type' = 'application/json'
  } -Body $body
  Write-Host "Response:"
  $resp | ConvertTo-Json -Depth 3
} catch {
  Write-Host "Error status:" $_.Exception.Response.StatusCode
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  $reader.BaseStream.Position = 0
  $reader.DiscardBufferedData()
  $body = $reader.ReadToEnd()
  Write-Host "Body:" $body
}
