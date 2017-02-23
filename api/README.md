## How to use API as WSGI (example configuration for Apache)

```
<VirtualHost *:443>
    DocumentRoot "/var/www/dev"
    ServerName example.com
    SSLEngine on
    SSLCertificateFile "/etc/apache2/server.crt"
    SSLCertificateKeyFile "/etc/apache2/server.key"

    ErrorLog "/var/log/apache2/secure-error_log"
    CustomLog "/var/log/apache2/secure-access_log" common

	#Options Includes FollowSymLinks MultiViews

    WSGIDaemonProcess libapi user=liberouter group=liberouter threads=5
	WSGIScriptAlias "/libapi" "/var/www/dev/liberouter-gui/wsgi.py"

	<directory "/var/www/dev/liberouter-gui">
        WSGIProcessGroup libapi
        WSGIApplicationGroup %{GLOBAL}
        WSGIScriptReloading On
        Order deny,allow
        Allow from all
    </directory>
</VirtualHost>
```
