SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

ROOT_DIR="$SCRIPT_DIR"
echo "checking root directory permissions at $ROOT_DIR"
if [ "$(stat -c '%a' "$ROOT_DIR")" == "755" ]
then
    echo "changing permissions of $ROOT_DIR"
    chmod -R 755 "$ROOT_DIR"
else
    echo "already check permissions. nothing todo"
fi
PUBLIC_DIR="$SCRIPT_DIR/public"
echo "checking public directory permissions at $PUBLIC_DIR"
if [ "$(stat -c '%a' "$PUBLIC_DIR")" == "755" ]
then
    echo "changing permissions of $PUBLIC_DIR"
    chmod -R 755 "$PUBLIC_DIR"
else
    echo "already check permissions. nothing todo"
fi

BOOTSTRAP_DIR="$SCRIPT_DIR/bootstrap"
echo "checking bootstrap directory permissions at $BOOTSTRAP_DIR"
if [ "$(stat -c '%a' "$BOOTSTRAP_DIR")" == "755" ]
then
    echo "changing permissions of $BOOTSTRAP_DIR"
    chmod -R 777 "$BOOTSTRAP_DIR"
else
    echo "already check permissions. nothing todo"
fi

STORAGE_DIR="$SCRIPT_DIR/storage"
echo "checking storage directory permissions at $STORAGE_DIR"
if [ "$(stat -c '%a' "$STORAGE_DIR")" == "755" ]
then
    echo "changing permissions of $STORAGE_DIR"
    chmod -R 777 "$STORAGE_DIR"
else
    echo "already check permissions. nothing todo"
fi

PUBLIC_STORAGE="$SCRIPT_DIR/public/storage"
echo "checking symlink storage in #storage_link at $PUBLIC_STORAGE"
if [ -h "$PUBLIC_STORAGE" ]; then
    echo "remove storage link first"
    rm "$PUBLIC_STORAGE"
    echo "linking storage"
    php artisan storage:link
    echo "finish linking storage"
    echo "chmod 777 public storage dir"
    chmod -R 777 "$PUBLIC_STORAGE"
else
    echo "linking storage"
    php artisan storage:link
fi

vendor_dir="$SCRIPT_DIR/vendor"
echo "checking if vendor exists"
if [ -d "$vendor_dir" ]; then
    echo "composer already installed"
else
    echo "running composer install"
    composer install
fi
