Function Get-Process-Id ($ProcessName) {

    <#
        .SYNOPSIS
            Defines a global variable containing all process IDs associated with a matching process name.
        
        .DESCRIPTION
            The global variable will be in a `${ProcessName}_id` format.
            E.g., `get-process-id photoshop` will define a global variable `$photoshop_id`. `$photoshop_id[0]` will return the first (main) and possibly only ID of a given process name.

        .PARAMETER ProcessName
            The name of the process whose ID(s) to retrieve.
        
        .NOTES
            Author: Dominik Bošnjak
            Version History (MM-DD-YYYY)
                1.0: Dominik Bošnjak - 04/11/2023
                    - Initial build
    #>

    $id = Get-Process -Name $ProcessName | select -expand id

    New-Variable -Name $($ProcessName + '_id') -Value $id -Scope Global

}
