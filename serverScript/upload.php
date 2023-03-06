
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

    if(move_uploaded_file($_FILES["file"]["tmp_name"], $path)) {
        //error_log("CanopyApp image from ".$username." uploaded!");
    }
    else{
        error_log("CanopyApp image from ".$username." failed to upload:");
        error_log($_FILES["file"]["error"]);
    }

    $mail = new PHPMailer();
    $mail->SetFrom('NOREPLYEMAILHERE', 'CanopyApp');
    $mail->AddAddress($email, $username);
    $mail->Subject = 'CanopyApp Photo Uploaded';
    $mail->MsgHTML('Your picture was successfully uploaded to the Picture Post server.');
    $mail->AltBody = 'Your picture was successfully uploaded to the Picture Post server.';
    $mail->AddAttachment($path);

    if(!$mail->Send()) {
        error_log("CanopyApp Mail to ".$email." Error: ".$mail->ErrorInfo);
    } else {
        //error_log("CanopyApp Mail to ".$email." successful!");
    }
?>
