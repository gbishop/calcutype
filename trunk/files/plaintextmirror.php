<?php
echo "Text written by the Calcutype. <br />Written 2008, William Condon<br />Save this page as a Plain Text file (e.g. *.txt)<br /><br />";
$ttype = $_POST["maintext"];
$closebrace = str_ireplace(">","&gt;",$ttype);
$openbrace = str_ireplace("<","&lt;",$closebrace);
$nlinerep = str_ireplace("\n","<br />",$openbrace);

echo $nlinerep;
?>