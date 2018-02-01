docker exec contosoOpenLdap ldapmodify -a -x -h localhost -p 389 -D "cn=admin,dc=contoso,dc=com" -f /data/ldif/00-startup.ldif -c -w P@ss1W0Rd!
docker exec contosoOpenLdap ldapmodify -a -x -h localhost -p 389 -D "cn=admin,dc=contoso,dc=com" -f /data/ldif/01-output-groups.ldif -c -w P@ss1W0Rd!
docker exec contosoOpenLdap ldapmodify -a -x -h localhost -p 389 -D "cn=admin,dc=contoso,dc=com" -f /data/ldif/02-output-users.ldif -c -w P@ss1W0Rd!
