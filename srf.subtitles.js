// Workflow by David Zumbach (2020-11-26)
// Word cloud layout heavily inspired by Jason Davies, https://www.jasondavies.com/wordcloud/

// Display Subtitles
function displaySubtitles() {

    // Define function to get subtitles
    function getSubtitles(searchEmission, searchDate, outputType) {

        // Reset target elements
        document.getElementById("headerEmission").innerHTML = "";
        document.getElementById("headerSubtitle").innerHTML = "";
        document.getElementById("emissionTitle").innerHTML = "";
        document.getElementById("emissionLead").innerHTML = "";
        document.getElementById("emissionPicture").src = "placeholder.png";
        document.getElementById("headerVis").innerHTML = "";
        document.getElementById("endVis").innerHTML = "";
        document.getElementById("headerSubtitle").innerHTML = "";
        document.getElementById("subtitle").innerHTML = "";

        // Delete old wordcloud
        const oldWordcloud = document.getElementById("wordcloud")
        if (oldWordcloud !== null) {
            oldWordcloud.remove();
        }
        document.getElementById("displayFactor").innerHTML = "";

        // Delete old button
        const oldButton = document.getElementById("wordcloudButton")
        if (oldButton !== null) {
            oldButton.remove();
        }

        // Url components for search
        const search1Url1 = "https://www.srf.ch/play/v3/api/srf/production/search/media?searchTerm=";
        const search1Url2 = "&includeAggregations=false&shows=urn%3Asrf%3Ashow%3Atv%3A";
        const search1Url4 = "&from=".concat(searchDate, "&to=", searchDate);
        const search1Url5 = "&mediaType=video"

        // Get showID
        if (searchEmission == "10vor10") {
            var search1Url3 = "c38cc259-b5cd-4ac1-b901-e3fddd901a3d";
        } else if (searchEmission == "arena") {
            var search1Url3 = "09784065-687b-4b60-bd23-9ed0d2d43cdc";
        } else if (searchEmission == "rundschau") {
            var search1Url3 = "49863a84-1ab7-4abb-8e69-d8e8bda6c989";
        } else if (searchEmission == "schweizaktuell") {
            var search1Url3 = "cb28dd84-f0c8-4024-8f20-1a29f5a4ceb7";
        } else if (searchEmission == "sportpanorama") {
            var search1Url3 = "d57ed483-2724-46b7-b1ac-7a2aa7603f59";
        } else if (searchEmission == "puls") {
            var search1Url3 = "709898cb-2dba-45da-8e21-b1f416c39dc9";
        } else if (searchEmission == "kassensturz") {
            var search1Url3 = "78a6014e-8058-4bdd-88aa-824f846ca6f0";
        } else if (searchEmission == "club") {
            var search1Url3 = "0f532a74-d501-4470-be25-527a4fbb82fa";
        } else if (searchEmission == "einstein") {
            var search1Url3 = "f005a0da-25ea-43a5-b3f8-4c5c23b190b3";
        } else {
            // Tagesschau
            var search1Url3 = "ff969c14-c5a7-44ab-ab72-14d4c9e427a9";
        }

        // Build Url for search request
        let search1Url = search1Url1.concat(search1Url2, search1Url3, search1Url4, search1Url5);
        let searchInit = {
            method: "GET",
            mode: "cors",
            cache: "default"
        };
        let search1Request = new Request(search1Url, searchInit);

        // Fetch search request
        fetch(search1Request)
            .then(response => response.json())
            .then(data => {

                let search1Response = data["data"];

                // Select result with best fit
                // No emission 1 (Non-Tagesschau)
                if (search1Response["total"] == 0) {

                    alert("Für das gewünschte Datum konnte keine Ausstrahlung gefunden werden.");
                    return;

                } else if (/^ts-/.test(searchEmission)) {

                    // Tagesschau
                    var tsResults = search1Response["results"];

                    if (searchEmission == "ts-main") {

                        var tsResults2 = tsResults.filter(function (feature) {
                            return /Haupt|19\:30/.test(feature.title);
                        });

                    } else if (searchEmission == "ts-noon") {

                        var tsResults2 = tsResults.filter(function (feature) {
                            return /Mittag|12\:[0-9]{2}|13\:[0-9]{2}/.test(feature.title);
                        });

                    } else {

                        var tsResults2 = tsResults.filter(function (feature) {
                            return /Spät|22\:[0-9]{2}|23\:[0-9]{2}/.test(feature.title);
                        });

                    }

                    // No emission 2 (Tagesschau)
                    if (tsResults2.length == 0) {

                        alert("Für das gewünschte Datum konnte keine Ausstrahlung gefunden werden.");
                        return;

                    }

                    [search1Response] = tsResults2;

                } else {

                    // Other emissions
                    [search1Response] = search1Response["results"];

                }

                // Build Search Request 2
                const search2Url1 = "https://il.srgssr.ch/integrationlayer/2.0/mediaComposition/byUrn/urn:srf:video:";
                const search2Url3 = ".json?onlyChapters=false&vector=portalplay";
                let search2Url = search2Url1.concat(search1Response["id"], search2Url3);
                let searchRequest2 = new Request(search2Url, searchInit);

                // Fetch Search Request 2
                fetch(searchRequest2)
                    .then(response => response.json())
                    .then(data => {

                        // Extract Episode ID from Response 2
                        let episodeId = data["episode"]["id"];

                        // Build Search Request 3
                        const search3Url1 = "https://www.srf.ch/subtitles/srf/";
                        const search3Url3 = "/episode/de/vod/vod.m3u8";
                        let search3Url = search3Url1.concat(episodeId, search3Url3);
                        let searchRequest3 = new Request(search3Url, searchInit);

                        // Fetch Search Request 3
                        fetch(searchRequest3)
                            .then(response => response.text())
                            .then(text => {

                                // Get Subtitles Files
                                const rgPattern = /vtt\/chunks\/[0-9]+.vtt/g;
                                let subtitleFiles = text.match(rgPattern);

                                // Alert When No Files Match the Pattern
                                if (subtitleFiles == null) {

                                    // Show emission info
                                    document.getElementById("headerEmission").innerHTML = "Informationen zur Sendung";
                                    document.getElementById("emissionTitle").innerHTML = search1Response["title"];
                                    document.getElementById("emissionLead").innerHTML = search1Response["lead"];
                                    document.getElementById("emissionPicture").src = search1Response["imageUrl"];
                                    alert("Die gewünschten Sendung scheint über keinen Untertitel zu verfügen.");
                                    return;

                                }

                                // Search Url Components
                                const search4Url1 = "https://www.srf.ch/subtitles/srf/";
                                const search4Url3 = "/episode/de/vod/";
                                const subtitleLinks = [];

                                // Get Subtitle Files
                                for (const subtitleFile of subtitleFiles) {
                                    subtitleLinks.push(search4Url1.concat(episodeId, search4Url3, subtitleFile));
                                }

                                // Fetch all Files
                                let promises = subtitleLinks
                                    .map(url => fetch(url)
                                        .then(y => y.text()));

                                Promise
                                    .all(promises)
                                    .then(results => {

                                        // Get results
                                        const subtitles = results.join();

                                        // Extract text based on style
                                        // Subtiles = Raw, Subtitles2 = Rowwise splits, Subtitles3 = Itermediate for cleansing, Subtitles4 = Flow style, Subtitles5 = Markup with white to black.
                                        if (subtitles.match(/\>(.*?)\</g) == null) {

                                            // "Old school" subtitles without markup
                                            var subtitles2 = subtitles
                                                .replace(/[0-9]+\:[0-9]+\:[0-9]+\.[0-9]+/g, " ")
                                                .replace(/-->/g, " ")
                                                .replace(/\n[0-9]+\n/g, " ")
                                                .replace(/\n/g, "  ")
                                                .split(/\s\s+/g);

                                            var subtitles3 = subtitles2
                                                .join(" ")
                                                .replace(/\s\s+/g, " ")
                                                .replace(/,WEBVTT/g, "")
                                                .replace(/WEBVTT/g, "")
                                                .replace(/^./g, "");

                                        } else {

                                            // New subtitles with markup
                                            var subtitles2 = subtitles
                                                .match(/\>(.*?)\</g)
                                                .map(b => b.replace(/\>(.*?)\</g, "$1"));

                                            var subtitles3 = subtitles2.join(" ");

                                        }

                                        // General replacements
                                        let subtitles4 = subtitles3
                                            .replace(/([0-9])- (?!(und|oder|bis))/g, "$1-")
                                            .replace(/([A-Z])- (?!(und|oder|bis))/g, "$1-")
                                            .replace(/([A-z])- (?!(und|oder|bis))/g, "$1") // separated words
                                            //            .replace(/ SWISS TXT.*$/, "")
                                            .replace(/SWISS TXT AG \/ Access Services/g, "")
                                            .replace(/Livepassagen können Fehler enthalten. /g, "")
                                            .replace(/MIT TELETEXT-UNTERTITELUNG /g, "")
                                            .replace(/Mit Live-Untertiteln von SWISS TXT/g, "")
                                            .replace(/Mit Untertiteln von SWISS TXT/g, "")
                                            .replace(/1:1-Untertitelung./g, "")
                                            .replace(/^\./, " ")
                                            .trim();

                                        // Emission hyperlink
                                        let emissionLink = "https://www.srf.ch/play/tv/tagesschau/video/" +
                                            search1Response["title"]
                                                .replace(/\:/g, "")
                                                .replace(/\./g, "-")
                                                .replace(/\s+/g, "-")
                                                .toLowerCase() +
                                            "?urn=" +
                                            search1Response["urn"];

                                        // Define output
                                        document.getElementById("headerEmission").innerHTML = "Informationen zur Sendung";
                                        document.getElementById("emissionTitle").innerHTML = "<a href=" + emissionLink + " target=_blank>" + search1Response["title"] + "</a>";
                                        document.getElementById("emissionLead").innerHTML = search1Response["lead"];
                                        document.getElementById("emissionPicture").src = search1Response["imageUrl"];
                                        document.getElementById("headerSubtitle").innerHTML = "Untertitel";

                                        // Output subtitle (and handle button)
                                        if (outputType == "flow") {

                                            // Subtitle
                                            document.getElementById("subtitle").innerHTML = subtitles4;

                                            // Create wordcloud button
                                            const newButton = document.createElement("button");
                                            newButton.innerHTML = "Word Cloud";
                                            newButton.id = "wordcloudButton";
                                            newButton.className = "btn btn-primary";
                                            newButton.onclick = function () {
                                                analyzeSubtitles(); return false;
                                            };

                                            document.getElementById("buttons").appendChild(newButton);

                                        } else if (outputType == "line") {

                                            // Subtitle
                                            document.getElementById("subtitle").innerHTML = subtitles2.join("</br>");

                                        } else {

                                            // Subtitle
                                            const subtitles5 = subtitles.replace(/\n/g, "</br>").replace(/#ffffff/g, "#000000");
                                            document.getElementById("subtitle").innerHTML = subtitles5;

                                        }

                                        // Delete old wordcloud
                                        const oldWordcloud = document.getElementById("wordcloud")
                                        if (oldWordcloud !== null) {
                                            oldWordcloud.remove();
                                        }

                                    });

                            });


                    });

            });
    }

    // Execute
    const searchEmission = document.getElementById("sendung").value;
    const searchDate = document.getElementById("datum").value;
    const outputType = document.getElementById("ausgabeart").value;
    getSubtitles(searchEmission, searchDate, outputType);

}

// Analyze Subtitles
function analyzeSubtitles() {

    // Remove old wordcloud
    const oldWordcloud = document.getElementById("wordcloud")
    if (oldWordcloud !== null) {
        oldWordcloud.remove();
    }

    // Get subtitle
    const subtitle = document.getElementById("subtitle").innerHTML;

    // Title
    document.getElementById("headerVis").innerHTML = "Word Cloud";
    document.getElementById("endVis").innerHTML = "<hr>";

    // Tokenize text
    let frequency_list = {};
    let stringArray = subtitle
        .replace(/Mio. /g, "Millionen ")
        .replace(/Mrd. /g, "Milliarden ")
        .replace(/Min. /g, "Minuten ")
        .replace(/Std. /g, "Stunden ")
        .replace(/Fr. /g, "Franken ")
        .replace(/Wir untertiteln live/g, " ")
        .replace(/Sie sprechen durcheinander/g, "")
        .replace(/\(Offstimme\)/g, "")
        .replace(/Offstimme/g, "")
        .replace(/St.(\s|)Galle([a-z]+)\b/g, "St_Galle$2")
        .replace(/\"/g, "")
        .replace(/[.!?:] [A-ZÄÖÜ]/g, " ")
        .replace(/\-/g, " ")
        .replace(/Sie|Ihnen|Ihre|Ihr/g, "")
        .match(/(\b[A-ZÄÖÜ][A-zäöüéèëêáàâ]+\b)/g);

    // Frequency list
    for (let i = 0; i < stringArray.length; i++) {
        let word = stringArray[i];
        if (frequency_list[word]) {
            frequency_list[word]++;
        } else {
            frequency_list[word] = 1;
        }
    }

    // Top 100
    const frequency_list2 = Object.entries(frequency_list)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 99)
        .filter(([, a]) => a > 1)
        .reduce((r, [a, b]) => ({ ...r, [a]: b }), {});

    // console.log(frequency_list2);

    // Prep for word cloud
    const frequency_list3 = [];
    for (var prop in frequency_list2) {
        frequency_list3.push({
            text: prop,
            size: frequency_list2[prop]
        })
    }

    // Display Factor 
    const sizeMax = Math.max(...Object.values(frequency_list));
    const [size20] = Object.values(frequency_list2).slice(19, 20);
    let powerRange = Array.from(Array(1000).keys())
    remIndex = 1;

    for (i = 1; i < powerRange.length; i++) {

        if ((Math.pow(size20, i / 100) / Math.pow(sizeMax, i / 100)) > 0.2 & (Math.pow(size20, i / 100) / Math.pow(sizeMax, i / 100)) < 0.3) {
            displayFactor = i + 1;
            break;
        }
    }
    document.getElementById("displayFactor").innerHTML = "Skalierung: n" + "<sup>" + displayFactor / 100 + "</sup>";

    // Orientations
    let result = [];
    for (var i = -60; i != 61; ++i) result.push(i)
    let orientations = [];
    for (var i = 0; i != 5; ++i) orientations.push(result[Math.floor(Math.random() * result.length)])

    // Colors
    // const colors = ["#5254A3", "#8CA252", "#9C9EDE", "#BD9E39", "#E7CB94", "#E7969C", "#DE9ED6", "#CDCEE5"];
    const colors = ["#F8B195", "#F67280", "#C06C84", "#6C5B7B", "#355C7D"];

    // Layout
    d3.layout.cloud()
        .size([960, 600])
        .words(frequency_list3)
        .padding(0)
        .rotate(function () { return orientations[Math.floor(Math.random() * orientations.length)]; })
        .font("Impact")
        .fontSize(function (d) { return 100 * (Math.pow(d.size, displayFactor / 100) / Math.pow(sizeMax, displayFactor / 100)); })
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select("#vis").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("id", "wordcloud")
            .attr("viewBox", "0 0 960 600")
            .append("g")
            .attr("transform", "translate(480,300)")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .style("fill", function () { return colors[Math.floor(Math.random() * colors.length)]; })
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    }

}