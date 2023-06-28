SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo "cmodding 755 of $SCRIPT_DIR"
chmod -R 755 "$SCRIPT_DIR"
echo "chmodding 777 of bootstrap dir"
BOOTSTRAP_DIR="$SCRIPT_DIR/bootstrap"
chmod -R 777 "$BOOTSTRAP_DIR"
echo "chmodding 777 of storage dir"
STORAGE_DIR="$SCRIPT_DIR/storage"
chmod -R 777 "$STORAGE_DIR"

vendor_dir="$SCRIPT_DIR/vendor"
echo "checking if vendor exists"
if [ -d "$vendor_dir" ]; then
    echo "composer already installed"
else
    echo "running composer install"
    composer install
fi

storage_link="$SCRIPT_DIR/public/storage"
echo "checking symlink storage in #storage_link"
if [ -h "$storage_link" ]; then
    echo "remove storage link first"
    rm "$storage_link"
    echo "linking storage"
    php artisan storage:link
    echo "finish linking storage"
else
    echo "linking storage"
    php artisan storage:link
fi

echo "checking root directory permissions"
root_dir="$SCRIPT_DIR"
if [ "$(stat -c '%a' "$root_dir")" == "755" ]
then
    echo "changing permissions of $root_dir"
    chmod -R 755 "$root_dir"
  # something
else
    echo "already check permissions. nothing todo"
fi
public_dir="$SCRIPT_DIR/public"
echo "checking public directory permissions"
if [ "$(stat -c '%a' "$public_dir")" == "755" ]
then
    echo "changing permissions of $public_dir"
    chmod -R 755 "$public_dir"
else
    echo "already check permissions. nothing todo"
fi

chmod -R 755 "$SCRIPT_DIR"
