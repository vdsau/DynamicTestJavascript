// JavaScript source code by @vdsau
function loadFile() {
    var input, file, fr, text, mark, //оценка
        passed, // позиция последнего ответа по уровню сложности
        sections; // секции с вопросами (блоки), например LAN

    var end = false; //конец теста 

    var combo = {// серия правильных ответов
        "local": 0, //по уровню сложности
        "global": 0, // глобальній
        "easy": 2, //количество по уровням сложности
        "normal": 3,
        "hard": 3,
        "zero": function () {
            this.local = 0;
            this.global = 0;
        }
    };
    var current = {
        difficultIndex: 0, //индекс в массиве уровней сложности, для доступа к названию уровня сложности
        sectionIndex: 0, //индекс в массиве секций секции (блока)
        sectionName: "", //название текущей (выбраной и находящейся в использовании) секции (блока)
        difficultName: "", //название текущего уровня сложности
    };
    var area = document.getElementsByTagName("content")[0];

    var difficult = ["easy", "normal", "hard"];

    var hr = document.createElement("hr");

    if (typeof window.FileReader !== 'function') {
        alert("Browser doesn't work with local files");
        return;
    }
    input = document.getElementById('fileinput');
    if (!input) {
        alert("Input not found.");
    }
    else if (!input.files) {
        alert("Browser doesn't work with local files");
    }
    else if (!input.files[0]) {
        alert("Select questions file ( JSON )!!!");
    }
    else {
        endedSections = [];
        current.difficultName = difficult[current.difficultIndex];
        sections = [];
        passed = { "easy": 0, "normal": 0, "hard": 0 };
        mark = 0;
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }
    function receivedText(e) {
        lines = e.target.result;
        text = JSON.parse(lines);
        for (var i in text) sections.push(i);
        current.sectionName = sections[current.sectionIndex].toString();
        startTest();
    }
    function startTest() {
        createQuestion();
    }
    function createQuestion() {
        createHeader();
        createContent();
        createFooter();
    }
    function endTest() {
        var area = document.getElementsByTagName("content")[0];
        area.innerHTML = "";
        var congr = document.createElement("div");
        congr.id = 'win';
        congr.innerHTML = "Congratulation!!!<br> You ended test!<br>Ваша оцінка : " + mark;
        area.appendChild(congr);
    }
    function createHeader() {
        area.innerHTML = "";
        var capt = document.createElement("div");
        capt.textContent = eval("text." + current.sectionName.toString() + ".caption").toString();
        capt.id = 'theme';
        area.appendChild(capt);
    }
    function createNav() {
        var next = document.createElement("button");
        var end = document.createElement("button");
        end.textContent = "End test";
        next.textContent = "Next";
        next.onclick = nextQuestion;
        end.onclick = endTest;
        area.appendChild(next);
        area.appendChild(end);
    }
    function generateQuestion() {
        var question = eval("text." + current.sectionName.toString() + ".questions." + current.difficultName.toString() + "[passed." + current.difficultName.toString() + "]");
        var txt = document.createTextNode(question.question.toString());
        area.appendChild(txt);
        var list = document.createElement("ol");
        for (var i in question.variants) {
            var li = document.createElement("li");
            var temp = document.createElement("input");
            temp.id = i;
            temp.type = 'radio';
            temp.name = 'qstn';
            temp.value = question.variants[i];
            li.appendChild(temp);
            li.appendChild(document.createTextNode(question.variants[i].toString()));
            list.appendChild(li);
        }
        area.appendChild(list);
        createNav();
    }
    function checkFields(arr) { //выбран хотя бы 1 вариант ответа?
        var res;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].checked === true) {
                res = true;
                break;
            } else res = false;
        }
        return res;
    }
    function checkAnswer() {
        var arr = document.getElementsByName("qstn");
        var res = 0;
        if (checkFields(arr)) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].checked === true) {
                    if (arr[i].id.toString() === eval("text." + current.sectionName.toString() + ".questions." + current.difficultName.toString() + "[passed." + current.difficultName.toString() + "].answer.toString()")) {
                        res = 1;
                        break;
                    }
                    else res = 0;
                }
            }
        } else res = 2;
        return res;
    }
    function changeDifficult(diff) {
        current.difficultName = diff.toString();
    }
    function setPassed(value) {
        for (var i in passed) passed[i] = value;
    }
    function isLastDifficult() {
        return (current.difficultIndex === difficult.length - 1) ? true : false;
    }
    function isLastSection() {
        return (current.sectionIndex === sections.length - 1) ? true : false;
    }
    function isEnd() {
        var res = false;
        if (isLastDifficult()) { //если текущий уровень сложности последний
            if (isLastSection()) end=true;  //текущий блок последний 
             else {
                current.sectionIndex++;
                current.difficultIndex = 0;
                current.sectionName = sections[current.sectionIndex].toString();
                changeDifficult(difficult[current.difficultIndex].toString());
                combo.zero();
                setPassed(0);
            }
        } else { //поднять уровень сложности
            combo.local = 0;
            current.difficultIndex++;
            changeDifficult(difficult[current.difficultIndex].toString());
        }
    }
    function acceptAnswer() {
        var tmp = eval("passed." + current.difficultName.toString());
        var numOfQuestions = eval("text." + current.sectionName.toString() + ".questions." + current.difficultName.toString() + ".length;"); //количество вопросов по уровню сложности
        if (tmp < numOfQuestions - 1) {//если есть неотвеченные вопросы в текущем уровне сложности (-1 потмоу что отсчёт начинается с 0 (4<5))
            eval("passed." + current.difficultName.toString() + "++;");
        } else {
            isEnd();
        }
    }
    function fillMarks() {
        for (var i in passed) {
            var length = eval("text." + current.sectionName.toString() + ".questions." + i.toString() + ".length-1;"); //количество вопросов по уровню сложности
            var crnt = eval("passed." + i.toString());
            mark += (length - crnt);
        }
    }
    function checkCombo() {
        function changeSettings(diffIndex, comboGlobalValue) {
            current.difficultIndex = diffIndex;
            changeDifficult(difficult[current.difficultIndex]);  //повысить уровень сложности до среднего
            combo.global = comboGlobalValue;
            combo.local = 0;
        };
        var res = false;
        if (combo.global === 0 && combo.local === combo.easy && current.difficultName.toString() === difficult[0].toString()) {//легкий УС
            res = true;
            changeSettings(1, combo.easy + combo.normal); 
        }
        if ((combo.global === (combo.easy + combo.normal)) && combo.local === combo.normal && current.difficultName.toString() === difficult[1].toString()) { //средний УС
            res = true;
            changeSettings(2, combo.easy + combo.normal + combo.hard);
        }
        if ((combo.global === (combo.easy + combo.normal + combo.hard)) && combo.local === combo.hard && current.difficultName.toString() === difficult[2].toString()) {//очень успешный парень
            res = true;
            fillMarks();
            for (var i = 0; i < difficult.length; i++) {
                var length = eval("text." + current.sectionName.toString() + ".questions." + difficult[i].toString() + ".length;"); //количество вопросов по уровню сложности
                eval("passed." + difficult[i].toString() + "=" + length - 1);
            }
            combo.zero();
            isEnd();
        }
        return res;
    }
    function decreaseCombo() {  
        var res = false;
        var temp, length;
        function tmp(newIndex, oldIndex) {
            combo.local = 0;
            current.difficultIndex = newIndex;
            length = eval("text." + current.sectionName.toString() + ".questions." + difficult[current.difficultIndex].toString() + ".length-1;"); //количество вопросов по уровню сложности
            temp = eval("passed." + difficult[current.difficultIndex].toString());
            if (length === temp) { //если последний ответ по уровню сложности
                res = false;
                current.difficultIndex = oldIndex;
            } else {
                eval("passed." + difficult[current.difficultIndex].toString()+"++;");
                changeDifficult(difficult[current.difficultIndex]);
            }
        };
        if (current.difficultName.toString() === difficult[1].toString() && ((combo.global < combo.easy + combo.normal + combo.hard ) && combo.global > combo.easy)) { //УС=средний 
            res = true;
            tmp(0,1);
        }
        if (current.difficultName.toString() === difficult[2].toString() && combo.global > combo.normal) {  //УС= сложно
            res = true;
            tmp(1,2);
        }
        return res;
    }
    function nextQuestion() {
        switch (checkAnswer()) {
            case 0:  //неправильный ответ
                if (decreaseCombo() === false) {
                    combo.local = 0;
                    acceptAnswer();
                }
                if (end === true) endTest();
                else createQuestion();
                break;
            case 1: //правильный ответ
                combo.local++;
                if (checkCombo() === false) acceptAnswer();
                mark++;
                if (end === true) endTest();
                else createQuestion();
                break;
            case 2: //нет ответа
                alert("Select answer!!!");
                break;
        }
    }
    function createContent() {
        generateQuestion();
    }
    function createFooter() {
        var tmp = document.createElement("div");
        tmp.textContent = "Passing score - 35 ";
        area.appendChild(tmp);
    }
}