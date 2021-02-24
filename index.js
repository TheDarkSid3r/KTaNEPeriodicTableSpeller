const repoURL = "https://ktane.timwi.de";
const difficultyChart = ["VeryEasy", "Easy", "Medium", "Hard", "VeryHard"];
const getElementColor = (d) => {
    const getColorValue = (s, e, l) => 255 * (s + (e - s) * l);
    const colorToColor = (c1, c2, l) => {
        var r = { r: 0, g: 0, b: 0 };
        Object.keys(r).forEach((k) => r[k] = getColorValue(c1[k], c2[k], l));
        return r;
    };
    return colorToColor({ r: 0, g: 1, b: 0 }, { r: 1, g: 0, b: 0 }, d / 8);
};

$.getJSON(repoURL + "/json/raw", (d) => {
    $(".loader").fadeOut(200);
    $(".content").fadeIn(200);

    var data = d.KtaneModules.filter((e) => !e.TranslationOf && e.Symbol);
    data.forEach((e) => {
        var dateMods = [].concat(data);
        dateMods.sort((a, b) => new Date(a.Published) - new Date(b.Published));
        e.Number = dateMods.findIndex((m) => m.ModuleID == e.ModuleID) + 1;
        var ex = difficultyChart.indexOf(e.ExpertDifficulty);
        if (ex < 0) ex = 0;
        var de = difficultyChart.indexOf(e.DefuserDifficulty);
        if (de < 0) de = 0;
        e.Difficulty = ex + de;
        e.AverageDifficulty = e.Difficulty / 2;
    });

    console.log(data);

    const maxSymbolLength = Math.max(...data.map((e) => e.Symbol.length));

    const spell = (input) => {
        var output = [];
        var string = input.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        var y = 0;
        while (y < string.length) {
            var found = false;
            for (var x = string.length; x > y; x--) {
                var lookahead = string.substring(y, x);
                var el = data.find((e) => e.Symbol.toLowerCase() == lookahead);
                if (el) {
                    output.push(el);
                    found = lookahead;
                    break;
                }
            }
            if (found === false) y++;
            else y += found.length;
        }
        return output;
    };

    const elsToSyms = (els) => els.map((e) => e.Symbol);
    const elsAreSame = (el1, el2) => JSON.stringify(el1) == JSON.stringify(el2);

    const wordinput = $(".word-input");

    var lastResult = [];

    const update = () => {
        const input = wordinput.val();
        const elements = spell(input);
        const symbols = elsToSyms(elements);
        if (elsAreSame(symbols, lastResult)) return;
        const wrapper = $(".elements-output").empty();
        elements.forEach((s) => {
            var e = $("<div/>").addClass("element");
            var icon = $("<img/>").addClass("element-icon").attr({ src: repoURL + "/Icons/" + encodeURIComponent(s.FileName || s.Name) + ".png" }).on("error", () => icon.off("error").attr({ src: repoURL + "/Icons/blank.png" })).appendTo(e);
            var color = getElementColor(s.Difficulty);
            $("<div/>").addClass("element-color").css({ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }).appendTo(e);
            $("<span/>").addClass("element-number").text(s.Number).appendTo(e);
            $("<span/>").addClass("element-symbol").text(s.Symbol).css({ fontSize: [70, 70, 60, 55, 50][s.Symbol.length - 1] }).appendTo(e);
            $("<span/>").addClass("element-name").text(s.Name).appendTo(e);
            $("<span/>").addClass("element-diff").text(s.AverageDifficulty + 1).appendTo(e);
            var date = new Date(s.Published);
            var year = date.getFullYear().toString();
            var dateparts = [date.getDate(), year.substring(0, 2), date.getMonth(), year.substring(2)];
            $("<span/>").addClass("element-date").text(dateparts.join("-")).appendTo(e);
            wrapper.append(e);
        });
        lastResult = symbols;
    };

    wordinput.on("input", update);
});