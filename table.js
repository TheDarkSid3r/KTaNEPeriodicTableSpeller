const repoURL = "https://ktane.timwi.de";
const squareWidth = 100;
const squareHeight = 100;
const difficultyChart = ["VeryEasy", "Easy", "Medium", "Hard", "VeryHard"];
$.getJSON(repoURL + "/json/raw", (d) => {
    var data = d.KtaneModules.filter((e) => !e.TranslationOf && e.Symbol);
    data.forEach((e) => {
        var ex = difficultyChart.indexOf(e.ExpertDifficulty);
        if (ex < 0) ex = 0;
        var de = difficultyChart.indexOf(e.DefuserDifficulty);
        if (de < 0) de = 0;
        e.Difficulty = ex + de;
        e.AverageDifficulty = e.Difficulty / 2;
    });
    data.sort((a, b) => a.Difficulty - b.Difficulty);

    const canvas = document.createElement("canvas");
    $(document.body).append($(canvas).addClass("main-canvas"));
    const ctx = canvas.getContext("2d");

    const getColor = (d) => {
        const getColorValue = (s, e, l) => 255 * (s + (e - s) * l);
        const colorToColor = (c1, c2, l) => {
            var r = { r: 0, g: 0, b: 0 };
            Object.keys(r).forEach((k) => r[k] = getColorValue(c1[k], c2[k], l));
            return r;
        };
        return colorToColor({ r: 0, g: 1, b: 0 }, { r: 1, g: 0, b: 0 }, d);
    };

    const drawElementSquare = (e, x, y, i, lerp) => {
        var rx = x * squareWidth;
        var ry = y * squareHeight;

        if (!e.spacer) {
            var icon = new Image();
            icon.src = repoURL + "/Icons/" + encodeURIComponent(e.FileName || e.Name) + ".png";
            icon.onload = () => {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(icon, rx + 1, ry + 1, 98, 98);
                ctx.imageSmoothingEnabled = true;
                var color = getColor(lerp);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`;
                ctx.fillRect(rx + 1, ry + 1, 98, 98);
                var sym = e.Symbol || "??";
                var size = [42, 42, 40, 36, 32][sym.length - 1];
                ctx.font = size + "px WarowniaBd";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(sym, rx + squareWidth / 2, ry + squareHeight / 2 - 10);
                ctx.font = "18px WarowniaBd";
                ctx.fillText(i + 1, rx + squareWidth / 2, ry + 12);
                ctx.font = Math.min(180 / e.Name.length, 16) + "px WarowniaBd";
                ctx.fillText(e.Name, rx + squareWidth / 2, ry + squareHeight / 2 + 18);
                ctx.font = "16px WarowniaBd";
                ctx.fillText(e.AverageDifficulty + 1, rx + squareWidth / 2, ry + squareHeight / 2 + 32);
            };
            icon.onerror = () => {
                icon.src = repoURL + "/Icons/blank.png";
                icon.onerror = null;
            };
        }
    };

    const rowLength = Math.ceil(Math.sqrt(data.length));
    const numRows = Math.ceil(data.length / rowLength);
    canvas.width = rowLength * squareWidth;
    canvas.height = numRows * squareHeight;
    data.forEach((e, i) => {
        drawElementSquare(e, i % rowLength, Math.floor(i / rowLength), i, i / (data.length - 1));
    });
}).catch(console.log);