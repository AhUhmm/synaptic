@ECHO OFF

cd C:\Users\feder\Documents\@_code\stable-diffusion-webui\
start webui-user.bat

:loop
FOR /F "tokens=*" %%i IN ('curl -s -o NUL -w "%%{http_code}" http://localhost:7861/sdapi/v1/memory') DO (
    IF "%%i" NEQ "200" (
        timeout /t 5 >NUL
        goto loop
    )
)

cd C:\Users\feder\Desktop\synaptic\
del .\media\*.png
start synaptic.maxproj
