echo "GIT RESET"
git reset --hard
echo "GIT PULL"
git pull

echo "FIX DIRECTORY PERMISSIONS"
sh fix-directory.sh
