<?php
$file = $_FILES['form'];
$allowedExtensions = array("html", "htm", "txt");

function isAllowedExtension($fileName) {
  global $allowedExtensions;
  return in_array(end(explode(".", $fileName)), $allowedExtensions);
}

if($file['error'] == UPLOAD_ERR_OK && isAllowedExtension($file['name'])) {
  echo file_get_contents($_FILES["form"]);
}
else {
  echo "Cannot upload.  Either there was a server error or you provided an invalid file type.  Valid file types include <tt>*.html</tt>, <tt>*.htm</tt>, and <tt>*.txt</tt>.";
}
?>
