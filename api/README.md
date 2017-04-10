## How to use API as WSGI (example configuration for Apache)

This example is for Apache VirtualHost instance on https. You can of course use it without the virtualhost but remeber to include the whole Liberouter GUI part and if required, change paths accordingly.

```
<VirtualHost *:443>
    DocumentRoot "/var/www/html"
    ServerName example.com
    SSLEngine on
    SSLCertificateFile "/etc/apache2/server.crt"
    SSLCertificateKeyFile "/etc/apache2/server.key"

    ErrorLog "/var/log/apache2/secure-error_log"
    CustomLog "/var/log/apache2/secure-access_log" common

	# Liberouter GUI WSGI
    WSGIDaemonProcess libapi user=liberouter group=liberouter threads=5
	WSGIScriptAlias "/libapi" "/var/www/html/liberouter-gui/api/wsgi.py"
	WSGIPassAuthorization on

	<directory "/var/www/html/liberouter-gui/api">
        WSGIProcessGroup libapi
        WSGIApplicationGroup %{GLOBAL}
        WSGIScriptReloading On
        Order deny,allow
        Allow from all
    </directory>
	# END Liberouter GUI WSGI
</VirtualHost>
```
