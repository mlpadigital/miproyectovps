# Panel VPS - uso para usuarios

Acceso rápido al panel del VPS desde el navegador (interfaz simple para ver estado y reiniciar servicios comunes).

URL: http://TU_DOMINIO_O_IP/panel/

Credenciales por defecto:
- Usuario: panel
- Contraseña: cambiar123  (por seguridad, cámbiala inmediatamente)

Funcionalidades:
- Muestra estado de Node, Nginx y UFW.
- Botones para reiniciar o consultar estado de `nginx` y `ufw`.

Seguridad:
- El acceso está protegido por autenticación básica de Nginx.
- El panel ejecuta `systemctl` mediante `sudo` configurado sin contraseña para el usuario `martin` (esto se configura para hacer más fácil el uso, pero es una excepción de seguridad). Cambia la contraseña y revisa `/etc/sudoers.d/vps-panel` si quieres endurecer la configuración.

Cambios recomendados:
- Actualizar la contraseña inmediatamente.
- Restringir acceso por IP en Nginx si sólo ciertos equipos deben acceder.
