# Recursively deletes all files not matching a given extension.
# I should figure out how to pass multiple extensions or a regex to it.
function Delete-All-But ($extensions){
>> Get-ChildItem -Recurse -File | Where {($_.Extension -ne "$extensions")} | Remove-Item
>> }
