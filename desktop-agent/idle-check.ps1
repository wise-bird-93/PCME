
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
    private static extern bool GetLastInputInfo(
        ref LASTINPUTINFO info
    );

    public static uint GetIdleMilliseconds()
    {
        LASTINPUTINFO info = new LASTINPUTINFO();
        info.cbSize = (uint)Marshal.SizeOf(info);

        if (!GetLastInputInfo(ref info))
            return 0;

        return unchecked(
            (uint)Environment.TickCount - info.dwTime
        );
    }
}
"@

while ($true) {
    $idle = [IdleTime]::GetIdleMilliseconds()
    $seconds = [math]::Floor($idle / 1000)

    Write-Output $seconds

    Start-Sleep -Seconds 1
}
