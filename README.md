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
