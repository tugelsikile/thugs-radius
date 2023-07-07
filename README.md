#### Freeradius Additional Configuration
- copy `resources/freeradius/mods-available/sql_master_edit_this` to your own freeradius `mods-available` directory
- edit file `sites-available/default` in your freeradius server
- about line `412`
  ```
  authorize {
      #
      #  Look in an SQL database.  The schema of the database
      #  is meant to mirror the "users" file.
      #
      #  See "Authorization Queries" in mods-available/sql
      #  sql
      redundant-load-balance sql {
         ### APPEND_SQL_AUTHORIZE ### <------ add this line
	        sql_1
	        sql_2
      }
  }
- about line `661`
  ```
  accounting {
	  #   Update accounting packet by adding the CUI attribute
      #................
      #sql
      redundant-load-balance sql {
          ### APPEND_SQL_ACCOUNTING ###
		        sql_1
		        sql_2
	     }
      #................
  }
- about line `703`
  ```
  session {
     #sql
     redundant-load-balance sql {
        ### APPEND_SQL_SESSION ###
		      sql_1
		      sql_2
     }
  }
- `post-auth` section, about line `780`
  ```
  post-auth {
     #sql
     redundant-load-balance sql {
         ### APPEND_SQL_POST_AUTH ###
         sql_1
         sql_2
     }
  }
- `Post-Auth-Type REJECT` section, about line `881`
  ```
  Post-Auth-Type REJECT {
     # log failed authentications in SQL, too.
     # sql
     redundant-load-balance sql {
         ### APPEND_SQL_POST_AUTH_TYPE_REJECT ###
         sql_1
         sql_2
     }
  }
- Edit file `mods-available\sqlippool` and add this line
  ```
  sqlippool {
     #  use the *instance* name here: sql1.
	    #APPEND_SQL_MODULE_INSTANCE <-- add this line
     sql_module_instance = sql1,sql2 
  }
- Edit file `sites-enabled\inner-tunnel` (optional / buggy)
  ```
  authorize {
     redundant-load-balance sql {
        ### APPEND_SQL_AUTHORIZE_TUNNEL ###
        sql_1
     }
  }
  session {
     redundant-load-balance sql {
        ### APPEND_SQL_SESSION_TUNNEL ###
        sql_1
     }
  }
  post-auth {
     redundant-load-balance sql {
        ### APPEND_SQL_POST_AUTH_TUNNEL ###
        sql_1
     }
     Post-Auth-Type REJECT {
        redundant-load-balance sql {
           ### APPEND_SQL_POST_AUTH_REJECT_TUNNEL ###
           sql_1
        }
     }
  }
- Edif file `mods-available\sqlcounter` (optional)
  ```
  sqlcounter dailycounter {
	    ###APPEND_DAILYCOUNTER
  }
  sqlcounter monthlycounter {
	    ###APPEND_MONTHLYCOUNTER
  }
  sqlcounter noresetcounter {
	    ###APPEND_NORESETCOUNTER
  }
  sqlcounter expire_on_login {
	    ###APPEND_EXPIREONLOGIN
  }
- those line above should be changed



#### Expired customer mod
- add or edit this file `freeradius/sites-enabled/default`
- about `line 429`
  ```
  expiration { 
      userlock = 1
  }
  if (userlock) {
      ok
      update reply {
         Reply-Message := "Mohon maaf, Pelanggan dengan nama %{User-Name} telah kadaluarsa"
         Framed-Pool := "Expired-Pool"
      }
  }
  ```
