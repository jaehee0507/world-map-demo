const generator = new WorldMapGenerator();

let styleDebounceTimer = null;
let lastStyleUpdate = 0;

function updateStyleWithDebounce(key, value) {
    // 1. 스로틀링: 실시간 미리보기 부하 줄이기 (50ms 간격 제한)
    let now = Date.now();
    if (now - lastStyleUpdate > 50) {
        generator.setCustomStyle(key, value, true);
        lastStyleUpdate = now;
    }
    
    // 2. 디바운싱: 입력이 멈추면 최종 적용 (무겁게)
    if (styleDebounceTimer) clearTimeout(styleDebounceTimer);
    styleDebounceTimer = setTimeout(function() {
        generator.setCustomStyle(key, value, false);
    }, 200); // 200ms 딜레이
}

window.addEventListener("load", () => {
    /**
     * 분쟁 국가 목록 UI를 갱신 함수
     */
    function refreshDisputeListUI() {
        const list = document.getElementById('dispute-list');
        if (!list) return;
        list.innerHTML = '';
        WorldMapGenerator.getDisputeCountries().forEach(entry => {
            const li = document.createElement('li');
            li.className = 'd-flex justify-content-between align-items-center mb-1';
            const span = document.createElement('span');
            span.textContent = entry;
            const btnGroup = document.createElement('span');
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-secondary mr-1';
            editBtn.textContent = '✏️';
            editBtn.onclick = () => {
                const newVal = prompt('분쟁 국가 쌍 수정', entry);
                if (newVal && newVal !== entry) {
                    WorldMapGenerator.removeDisputeCountry(entry);
                    WorldMapGenerator.addDisputeCountry(newVal);
                    refreshDisputeListUI();
                    generator.drawSVG(false);
                }
            };
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'btn btn-sm btn-danger';
            delBtn.textContent = '🗑️';
            delBtn.onclick = () => {
                WorldMapGenerator.removeDisputeCountry(entry);
                refreshDisputeListUI();
                generator.drawSVG(false);
            };
            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(delBtn);
            li.appendChild(span);
            li.appendChild(btnGroup);
            list.appendChild(li);
        });
    }
    // 분쟁 국가 목록 UI 이벤트 연결
    const addInput = document.getElementById('new-dispute-input');
    const addButton = document.getElementById('add-dispute-btn');
    if (addButton) {
        addButton.onclick = () => {
            const val = addInput.value.trim();
            if (val) {
                WorldMapGenerator.addDisputeCountry(val);
                addInput.value = '';
                refreshDisputeListUI();
                generator.drawSVG(false);
            }
        };
    }
    // 최초 로드 시 목록 갱신
    refreshDisputeListUI();

    /**
     * DEFAULT_STYLES로부터 모든 input 요소들을 초기화하는 함수
     */
    function initializeStyleInputs() {
        const defaultStyles = WorldMapGenerator.DEFAULT_STYLES;
        
        Object.keys(defaultStyles).forEach(function(key) {
            const selector = `input[oninput*="'${key}'"], input[onchange*="'${key}'"]`;
            const input = document.querySelector(selector);
            
            if (input) {
                let value = defaultStyles[key];
                
                // input type="color"는 6자리 hex 코드(#RRGGBB)가 필요하므로 변환
                if (input.type === 'color' && value.startsWith('#') && value.length === 4) {
                    value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
                }
                
                input.value = value;
            }
        });
    }
    // DEFAULT_STYLES로부터 초기화
    initializeStyleInputs();

    function checkInputNumberPossible(element) {
        if (parseFloat(element.value) > parseFloat(element.max))
            element.value = element.max;

        if (parseFloat(element.value) < parseFloat(element.min))
            element.value = element.min;
    }

    function onInputValue(numberInput, rangeInput, formType, forceSquash) {
        checkInputNumberPossible(numberInput);

        if (formType === "range")
            numberInput.value = parseFloat(rangeInput.value);
        else if (formType === "number")
            rangeInput.value = parseFloat(numberInput.value);

        generator.setRotate(Elements.NumberInput.lambda.value, Elements.NumberInput.phi.value, Elements.NumberInput.gamma.value);
        generator.setGraticules(Elements.NumberInput.latitude.value, Elements.NumberInput.longitude.value, Elements.NumberInput.inclination.value);
        generator.drawSVG(forceSquash);
    }

    generator.setSvgElementId("generated-svg");

    let Elements = {
        Button: {
            addShape: document.getElementById("add-shape"),
            deleteAllShapes: document.getElementById("delete-shape"),
            downloadSvg: document.getElementById("download-svg"),
            deselectAllAreas: document.getElementById("deselect-areas"),
            setDefaultCustomStyles: document.getElementById("default-customstyles"),
            setTypeUSA: document.getElementById("set-type-usa"),
            setTypeCJK: document.getElementById("set-type-cjk"),
            setTypeKOR: document.getElementById("set-type-kor")
        },
        NumberInput: {
            lambda: document.getElementById("lambda-form"),
            phi: document.getElementById("phi-form"),
            gamma: document.getElementById("gamma-form"),
            latitude: document.getElementById("lat-form"),
            longitude: document.getElementById("long-form"),
            inclination: document.getElementById("incl-form"),
            fromLatitude: document.getElementById("shape-input0"),
            fromLongitude: document.getElementById("shape-input1"),
            toLatitude: document.getElementById("shape-input2"),
            toLongitude: document.getElementById("shape-input3"),
            centerLatitude: document.getElementById("shape-input0"),
            centerLongitude: document.getElementById("shape-input1"),
            radius: document.getElementById("shape-input2")
        },
        RangeInput: {
            lambda: document.getElementById("lambda"),
            phi: document.getElementById("phi"),
            gamma: document.getElementById("gamma"),
            latitude: document.getElementById("lat"),
            longitude: document.getElementById("long"),
            inclination: document.getElementById("incl")
        },
        Label: {
            upper: document.getElementById("shape-label0"),
            lower: document.getElementById("shape-label1"),
            upperComma: document.getElementById("shape-comma0"),
            lowerComma: document.getElementById("shape-comma1")
        },
        OptionButton: document.getElementsByClassName("option-checkbox"),
        RadioButton: {
            circle: document.getElementById("shape-radio0"),
            line: document.getElementById("shape-radio1")
        }
    };

    for (const key in Elements.RangeInput) {
        Elements.RangeInput[key].oninput = () => { onInputValue(Elements.NumberInput[key], Elements.RangeInput[key], "range", true); };
        Elements.RangeInput[key].onchange = () => { onInputValue(Elements.NumberInput[key], Elements.RangeInput[key], "range", false); };
        Elements.NumberInput[key].oninput = () => { onInputValue(Elements.NumberInput[key], Elements.RangeInput[key], "number", false); };
    }

    Elements.Button.addShape.onclick = () => {
        if (generator.currentShape === "circle") {
            generator.addCircle(Elements.NumberInput.centerLatitude.value, Elements.NumberInput.centerLongitude.value, Elements.NumberInput.radius.value);
        } else if (generator.currentShape === "line") {
            generator.addLine(Elements.NumberInput.fromLatitude.value, Elements.NumberInput.fromLongitude.value, Elements.NumberInput.toLatitude.value, Elements.NumberInput.toLongitude.value);
        }
    };
    Elements.Button.deleteAllShapes.onclick = () => { generator.deleteAllShapes(); };
    Elements.Button.downloadSvg.onclick = () => { generator.downloadSVG(); };
    Elements.Button.deselectAllAreas.onclick = () => { generator.deselectAllAreas(); };
    Elements.Button.setDefaultCustomStyles.onclick = () => {
        generator.setDefaultCustomStyles();

        const defaultStyles = WorldMapGenerator.DEFAULT_STYLES;

        Object.keys(defaultStyles).forEach(function(key) {
            // 해당 key를 사용하는 input 요소를 속성 선택자로 찾음
            // JSP에서 oninput="generator.setCustomStyle('key', ...)" 형태로 사용되므로 이를 이용
            const selector = `input[oninput*="'${key}'"], input[onchange*="'${key}'"]`;
            const input = document.querySelector(selector);

            if (input) {
                let value = defaultStyles[key];

                // input type="color"는 6자리 hex 코드(#RRGGBB)가 필요하므로 
                // 3자리(#RGB)인 경우 6자리로 변환
                if (input.type === 'color' && value.startsWith('#') && value.length === 4) {
                    value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
                }

                input.value = value;
            }
        });
    };
    let _selectedIndexBefore = null;
    Elements.Button.setTypeUSA.onclick = () => {
        if (generator.type === WorldMapGenerator.GENERATOR_TYPES.VARIOUS) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.USA);
            _selectedIndexBefore = select.selectedIndex;
            select.selectedIndex = generator.projectionIndex;
            Elements.NumberInput.lambda.disabled = true;
            Elements.NumberInput.phi.disabled = true;
            Elements.NumberInput.gamma.disabled = true;
            Elements.RangeInput.lambda.disabled = true;
            Elements.RangeInput.phi.disabled = true;
            Elements.RangeInput.gamma.disabled = true;
            Elements.Button.setTypeUSA.textContent = "미국 중심 모드 해제";
            Elements.Button.setTypeCJK.disabled = true;
            Elements.Button.setTypeKOR.disabled = true;
            generator.drawSVG(false);
        } else if (generator.type === WorldMapGenerator.GENERATOR_TYPES.USA) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.VARIOUS);
            select.selectedIndex = _selectedIndexBefore;
            Elements.NumberInput.lambda.disabled = false;
            Elements.NumberInput.phi.disabled = false;
            Elements.NumberInput.gamma.disabled = false;
            Elements.RangeInput.lambda.disabled = false;
            Elements.RangeInput.phi.disabled = false;
            Elements.RangeInput.gamma.disabled = false;
            Elements.Button.setTypeUSA.textContent = "미국 중심 모드 설정";
            Elements.Button.setTypeCJK.disabled = false;
            Elements.Button.setTypeKOR.disabled = false;
            generator.drawSVG(false);
        }
    };
    Elements.Button.setTypeCJK.onclick = () => {
        if (generator.type === WorldMapGenerator.GENERATOR_TYPES.VARIOUS) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.CJK);
            _selectedIndexBefore = select.selectedIndex;
            select.selectedIndex = generator.projectionIndex;
            Elements.NumberInput.lambda.disabled = true;
            Elements.NumberInput.phi.disabled = true;
            Elements.NumberInput.gamma.disabled = true;
            Elements.RangeInput.lambda.disabled = true;
            Elements.RangeInput.phi.disabled = true;
            Elements.RangeInput.gamma.disabled = true;
            Elements.Button.setTypeCJK.textContent = "한중일 중심 모드 해제";
            Elements.Button.setTypeUSA.disabled = true;
            Elements.Button.setTypeKOR.disabled = true;
            generator.drawSVG(false);
        } else if (generator.type === WorldMapGenerator.GENERATOR_TYPES.CJK) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.VARIOUS);
            select.selectedIndex = _selectedIndexBefore;
            Elements.NumberInput.lambda.disabled = false;
            Elements.NumberInput.phi.disabled = false;
            Elements.NumberInput.gamma.disabled = false;
            Elements.RangeInput.lambda.disabled = false;
            Elements.RangeInput.phi.disabled = false;
            Elements.RangeInput.gamma.disabled = false;
            Elements.Button.setTypeCJK.textContent = "한중일 중심 모드 설정";
            Elements.Button.setTypeUSA.disabled = false;
            Elements.Button.setTypeKOR.disabled = false;
            generator.drawSVG(false);
        }
    };
    Elements.Button.setTypeKOR.onclick = () => {
        if (generator.type === WorldMapGenerator.GENERATOR_TYPES.VARIOUS) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.KOR);
            _selectedIndexBefore = select.selectedIndex;
            select.selectedIndex = generator.projectionIndex;
            Elements.NumberInput.lambda.disabled = true;
            Elements.NumberInput.phi.disabled = true;
            Elements.NumberInput.gamma.disabled = true;
            Elements.RangeInput.lambda.disabled = true;
            Elements.RangeInput.phi.disabled = true;
            Elements.RangeInput.gamma.disabled = true;
            Elements.Button.setTypeKOR.textContent = "한반도 중심 모드 해제";
            Elements.Button.setTypeUSA.disabled = true;
            Elements.Button.setTypeCJK.disabled = true;
            generator.drawSVG(false);
        } else if (generator.type === WorldMapGenerator.GENERATOR_TYPES.KOR) {
            generator.setType(WorldMapGenerator.GENERATOR_TYPES.VARIOUS);
            select.selectedIndex = _selectedIndexBefore;
            Elements.NumberInput.lambda.disabled = false;
            Elements.NumberInput.phi.disabled = false;
            Elements.NumberInput.gamma.disabled = false;
            Elements.RangeInput.lambda.disabled = false;
            Elements.RangeInput.phi.disabled = false;
            Elements.RangeInput.gamma.disabled = false;
            Elements.Button.setTypeKOR.textContent = "한반도 중심 모드 설정";
            Elements.Button.setTypeUSA.disabled = false;
            Elements.Button.setTypeCJK.disabled = false;
            generator.drawSVG(false);
        }
    };

    Array.from(Elements.OptionButton).forEach((e, i) => {
        const optionName = Object.keys(generator.Options)[i];
        if (optionName === "projectKoreaSido" || optionName === "projectKoreaSig" || optionName === "projectKoreaSigMerged")
            e.onchange = (radio) => {
                const ids = ["radio-sido", "radio-sig", "radio-sig-merged"];
                const options = ["projectKoreaSido", "projectKoreaSig", "projectKoreaSigMerged"];
                ids.forEach((id, index) => {
                    if (id === radio.target.id) {
                        generator.toggleOption({option: options[index], value: true, draw: false, source: "ui"});
                    } else {
                        generator.toggleOption({option: options[index], value: false, draw: false, source: "ui"});
                    }
                });
                generator.drawSVG(false);
            };
        else
            e.onclick = () => { generator.toggleOption({option: i, source: "ui"}); };
        e.checked = generator.Options[optionName];

        if (optionName === "projectChinaProvinceBorder")
            e.disabled = true;
    });

    generator.Callback.OptionToggled = (optionName, index, value, source) => {
        if (source === "api")
            Array.from(Elements.OptionButton)[index].checked = value;
    };

    generator.Callback.TypeChanged = (type) => {
        if (type === WorldMapGenerator.GENERATOR_TYPES.KOR) {
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectChinaProvinceBorder")].disabled = true;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaBasemap")].disabled = false;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSido")].disabled = false;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSig")].disabled = false;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSigMerged")].disabled = false;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("squashLand")].disabled = true;
        } else {
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectChinaProvinceBorder")].disabled = false;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaBasemap")].disabled = true;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSido")].disabled = true;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSig")].disabled = true;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("projectKoreaSigMerged")].disabled = true;
            Elements.OptionButton[Object.keys(generator.Options).indexOf("squashLand")].disabled = false;
        }
    };

    for (const key in Elements.RadioButton) {
        Elements.RadioButton[key].onchange = () => {
            generator.currentShape = key;
            if (generator.currentShape === "circle") {
                Elements.Label.upper.innerHTML = "중심 좌표[위도, 경도] : ";
                Elements.Label.lower.innerHTML = "반지름 : ";

                Elements.NumberInput.centerLatitude.value = 10;
                Elements.NumberInput.centerLongitude.value = 10;

                Elements.NumberInput.radius.value = 20;
                Elements.NumberInput.radius.max = 180;
                Elements.NumberInput.radius.min = 0.01;

                Elements.Label.lowerComma.style.visibility = "hidden";
                Elements.NumberInput.toLongitude.style.visibility = "hidden";
            } else if (generator.currentShape === "line") {
                Elements.Label.upper.innerHTML = "기점 좌표[위도, 경도] : ";
                Elements.Label.lower.innerHTML = "종점 좌표[위도, 경도] : ";

                Elements.NumberInput.fromLatitude.value = 10;
                Elements.NumberInput.fromLongitude.value = 10;

                Elements.NumberInput.toLatitude.value = 20;
                Elements.NumberInput.toLatitude.max = 90;
                Elements.NumberInput.toLatitude.min = -90;
                
                Elements.NumberInput.toLongitude.value = 20;
                Elements.NumberInput.toLongitude.max = 180;
                Elements.NumberInput.toLongitude.min = -180;

                Elements.Label.lowerComma.style.visibility = "visible";
                Elements.NumberInput.toLongitude.style.visibility = "visible";
            }
        };
    }

    for (const key in Elements.NumberInput) {
        if (Elements.NumberInput[key].oninput === null)
            Elements.NumberInput[key].oninput = () => { checkInputNumberPossible(Elements.NumberInput[key]) };
    }

    generator.setType(WorldMapGenerator.GENERATOR_TYPES.VARIOUS);

    // Various type만의 고유한 코드 (projection 선택 DOM과 WorldMapGenerator를 붙이는 코드)
    const select = document.getElementById("projection-select");
    WorldMapGenerator.PROJECTIONS.forEach((element, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.text = element.name;
        select.appendChild(opt);
    });

    select.selectedIndex = generator.projectionIndex;
    select.onchange = () => {
        generator.setProjection(WorldMapGenerator.PROJECTIONS[select.options[select.selectedIndex].value].name);
        generator.drawSVG(false);
    };
});