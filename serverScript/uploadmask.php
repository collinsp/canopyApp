<?php
	require './class.phpmailer.php';
	$email = $_POST['email'];
	$name = $_POST['name'];
	$username = $_POST['username'];
	
	$email = trim($email);
	$name = trim($name);
	$username = trim($username);
	
	$path1 = './'.$username.'/';
	$path = $path1.$name.'.jpg';
	
    if (!file_exists($path1))
        mkdir($path1);

    function checkName($path1, $name, $n, $num) {
        if (file_exists($n)) {
            $num++;
            $path = $path1.$name.'-'.$num.'.jpg';
            return checkName($path1, $name, $path, $num);
        }
        else
            return $n;
    }

    $path = checkName($path1, $name, $path, 1);
    $maskpath = $path1.$name.'-mask.jpg';
	$maskpath = checkName($path1, $name.'-mask', $maskpath, 1);
	
	$width=0;
	$height=0;
	
	$file = fopen($path, "r");
	$colarray[];
	while (!feof($file)) {
		$colarray[]=fgets($file);
	}
	fclose($file);
	
	$image = imagecreatefromjpeg($path);
	$size = getimagesize($path);
	$width = $size[0];
	$height = $size[1];
	$maskimage = imagecreatetruecolor($width, $height);
	
	function hex2rgb($hex) {
		$hex = str_replace("#", "", $hex);
		if(strlen($hex) == 3) {
			$r = hexdec(substr($hex,0,1).substr($hex,0,1));
			$g = hexdec(substr($hex,1,1).substr($hex,1,1));
			$b = hexdec(substr($hex,2,1).substr($hex,2,1));
		}
		else {
			$r = hexdec(substr($hex,0,2));
			$g = hexdec(substr($hex,2,2));
			$b = hexdec(substr($hex,4,2));
		}
		$rgb = array($r, $g, $b);
		//return implode(",", $rgb); // returns the rgb values separated by commas
		return $rgb;
	}
	
	$maskfail="Mask creation of ".$name." CanopyApp image from ".$username." failed: ";
	if($image) {
		if(!imagecopy($maskimage, $path, 0, 0, 0, 0, $width, $height))
			error_log($maskfail."Copy");
		foreach($colarray as $col) {
			$ar = hex2rgb($col);
			$index = imagecolorexact($maskimage, $ar[0], $ar[1], $ar[2]);
			while($index!=-1) {
				imagecolorset($maskimage, $index, $ar[0], $ar[1], $ar[2]);
				$index = imagecolorexact($maskimage, $ar[0], $ar[1], $ar[2]);
			}
		}
		
		if(!imagejpeg($maskimage, $maskpath))
			error_log($maskfail."Creation");
	}
	else
        error_log($maskfail."Create From JPEG");
	
    $mail = new PHPMailer();
    $mail->SetFrom('NOREPLYEMAILHERE', 'CanopyApp');
    $mail->AddAddress($email, $username);
    $mail->Subject = 'CanopyApp Photo Uploaded';
    $mail->MsgHTML('Your picture was successfully uploaded to the Picture Post server.');
    $mail->AltBody = 'Your picture was successfully uploaded to the Picture Post server.';
    $mail->AddAttachment($maskpath);

    if(!$mail->Send()) {
        error_log("CanopyApp Mail to ".$email." Error: ".$mail->ErrorInfo);
    } else {
        //error_log("CanopyApp Mail to ".$email." successful!");
    }
?>
