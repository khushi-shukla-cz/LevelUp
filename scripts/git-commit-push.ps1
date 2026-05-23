param(
  [Parameter(Mandatory=$true)][string]$Message,
  [string[]]$Files
)

if ($Files -and $Files.Count -gt 0) {
  git add @Files
} else {
  git add -A
}

git commit -m $Message
git push
