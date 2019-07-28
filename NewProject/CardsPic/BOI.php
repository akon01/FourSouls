<?php

    /*---------------------------------------------------------------------------------------------------------------------------------------------
    -This is a little PHP script that allows you to download every card in png format from foursoulsspoilers.com
    -Before running the script, check the parameters below.
    
    -It requires PHP and DOM/XML modules (if you happen to be on a Debian-based distro, the packages to install are php and php-xml)
    -If you need help installing PHP, go to http://php.net
    -You can do anything you want with this script, I don't really plan on maintaining it so if you want to modify and redistribute it, go ahead.
    
    -Enjoy. RagnarokToast/Shivs
    ---------------------------------------------------------------------------------------------------------------------------------------------*/

    $PATH = "images";   //Directory the script will download the .png files to.
    $START_ID = 0;     //The first ID the script will check on the website. By default it is set to 70 as it doesn't look like any card has id<70 right now.
    $TOTAL_CARDS = 506; //Total number of cards in the game. Right now base game + expansion is 408 cards.


    //Start functions
    function smkdir($p) {
        if (!file_exists($p))
            mkdir($p);
        
        if (!file_exists($p))
            die("Could not create download directory.");
    }
    
    function progressBar($done, $total) {
        $perc = floor(($done / $total) * 100);
        $left = 100 - $perc;
        $write = sprintf("\033[0G\033[2K[%'={$perc}s>%-{$left}s] - $perc%% - $done/$total ", "", "");
        fwrite(STDERR, $write);
    }

    function fc($p) {
        $r = 0;
        $dir = opendir($p);
        while ($i = readdir($dir)) {
            if ($i != "." && $i != "..") {
                if (is_dir($p."/".$i))
                    $r += fc($p."/".$i);
                else $r++;
            }
        }
        closedir($dir);
        return $r;
    }
    //End functions

    echo "-------------------------------------------------------\n";
    echo "--->>>FOUR SOULS CARD DOWNLOADER by RagnarokToast<<<---\n";
    echo "-------------------------------------------------------\n\n";
    echo "-> Images will be saved in \"".$PATH."\"\n";
    echo "-> The search will start with ID ".$START_ID."\n";
    echo "-> Press ENTER to continue...\n";
    fread(STDIN, 1);

    $root = "http://pop-life.com/foursouls/";
	$i = $START_ID;
    smkdir($PATH);
	$count = fc($PATH);
	while ($count < $TOTAL_CARDS) {
        echo "Current ID: ".$i;
		
        $doc = new DOMDocument();
        libxml_use_internal_errors(true);
		
        $html = file_get_contents($root."card.php?id=".$i);
        $doc->loadHTML($html);
        $xpath = new DomXPath($doc);

        $imgurl = $xpath->query("//div[@class='pageContent']/div[@class='container']/div[@class='row']//img")->item(0)->attributes->item(0)->value;
        
        if ($imgurl != "./data/cards/") {
            $cardtype = $xpath->query("//div[@class='pageContent']/div[@class='container']/h1")->item(0)->nodeValue;
            $cardname = $xpath->query("//div[@class='pageContent']/div[@class='container']/div[@class='row']//h2")->item(0)->nodeValue;

            smkdir("images/".$cardtype);
            if (!file_exists($PATH."/".$cardtype."/".$cardname.".png")) {
                file_put_contents($PATH."/".$cardtype."/".$cardname.".png", fopen($root.str_replace(" ", "%20", $imgurl), 'r'));
                $count++;
            }
            progressBar($count, $TOTAL_CARDS);
            echo "- ".$cardtype.": ".$cardname."\n";
        } else {
            progressBar($count, $TOTAL_CARDS);
            echo "- No card for ID $i\n";
        }

        $i++;
	}
    

    echo "\nDone.\n";
    
    return 0;
?>