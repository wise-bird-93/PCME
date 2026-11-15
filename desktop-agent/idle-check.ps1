
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public static class IdleTime
{
    [StructLayout(LayoutKind.Sequential)]
    private struct LASTINPUTINFO
    {
        public uint cbSize;
        public uint dwTime;
    }

    [DllImport("user32.dll")]
    private static extern bool GetLastInputInfo(ref LASTINPUTINFO info);

    public static uint GetIdleMilliseconds()
    {
        LASTINPUTINFO info = new LASTINPUTINFO();
        info.cbSize = (uint)Marshal.SizeOf(info);

        if (!GetLastInputInfo(ref info))
            return 0;

        return unchecked((uint)Environment.TickCount - info.dwTime);
    }
}
"@

$lastRecord = (Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    ProviderName = 'Microsoft-Windows-Kernel-Power'
    Id = 506, 507
} -MaxEvents 1 -ErrorAction SilentlyContinue).RecordId

if ($null -eq $lastRecord) {
    $lastRecord = 0
}

while ($true) {
    $idle = [IdleTime]::GetIdleMilliseconds()
    Write-Output ([math]::Floor($idle / 1000))

    $events = Get-WinEvent -FilterHashtable @{
        LogName = 'System'
        ProviderName = 'Microsoft-Windows-Kernel-Power'
        Id = 506, 507
    } -MaxEvents 10 -ErrorAction SilentlyContinue

    foreach ($event in ($events | Sort-Object RecordId)) {
        if ($event.RecordId -le $lastRecord) {
            continue
        }

        $timestamp = ([DateTimeOffset]$event.TimeCreated).ToUnixTimeMilliseconds()

        if ($event.Id -eq 506) {
            Write-Output "SLEEP_START|$timestamp"
        }
        elseif ($event.Id -eq 507) {
            Write-Output "SLEEP_END|$timestamp"
        }

        $lastRecord = $event.RecordId
    }

    Start-Sleep -Seconds 1
}
