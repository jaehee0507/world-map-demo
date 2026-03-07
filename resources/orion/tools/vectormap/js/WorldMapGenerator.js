/***************************************************
 *                World Map Generator               *
 *                 Made by Jo Jaehee                *
 *  Copyright 2026. Jo Jaehee all rights reserved.  *
 ***************************************************/

/**
 * 세계 지도 생성기 클래스
 * D3.js를 사용하여 다양한 투영법으로 지도를 생성하고 SVG로 렌더링합니다.
 */
class WorldMapGenerator {
    /**
     * @enum {symbol}
     */
    static GENERATOR_TYPES = Object.freeze({
        SPHERE: Symbol("SPHERE"),
        VARIOUS: Symbol("VARIOUS"),
        USA: Symbol("USA"),
        CJK: Symbol("CJK"),
        KOR: Symbol("KOR")
    });
    /**
     * 기본 스타일 설정: 지도 요소들의 기본 색상, 선 굵기, 패턴 등을 정의합니다.
     */
    static DEFAULT_STYLES = Object.freeze({
        oceanFillColor: "#ffffff",
        landStrokeColor: "#000000",
        landStrokeWidth: "0.4pt",
        landFillColor: "#cccccc",
        lakeStrokeColor: "#000000",
        lakeStrokeWidth: "0.3pt",
        lakeFillColor: "#ffffff",
        borderStrokeColor: "#000000",
        borderStrokeWidth: "0.3pt",
        borderStrokeDash: "1.5 1",
        disputeBorderStrokeColor: "#888888",
        disputeBorderStrokeWidth: "0.3pt",
        disputeBorderStrokeDash: "1.5 1",
        selectedCountryStrokeColor: "#000000",
        selectedCountryStrokeWidth: "1.0pt",
        selectedCountryFillColor: "#333333",
        circleStrokeColor: "#ff0000",
        circleStrokeWidth: "0.4pt",
        lineStrokeColor: "#0000ff",
        lineStrokeWidth: "0.4pt",
        culturalBoundaryStrokeColor: "#000000",
        culturalBoundaryStrokeWidth: "1.0pt"
    });
    /**
     * 분쟁 지역으로 간주되는 국가들의 집합입니다. 이 국가들은 특별한 스타일로 렌더링됩니다.
     * @type {Set<string>}
     */
    static DISPUTE_COUNTRIES = new Set([
                            "Kashmir(India)-India",
                            "Kashmir(India)-Pakistan",
                            "Kashmir(India)-China",
                            "Kashmir(India)-Kashmir(Pakistan)",
                            "Kashmir(India)-Kashmir(China)",
                            "Kashmir(Pakistan)-Pakistan",
                            "Kashmir(Pakistan)-China",
                            "Kashmir(Pakistan)-Kashmir(China)",
                            "Kashmir(China)-China",
                            "Hala'ib-Sudan",
                            "Hala'ib-Egypt",
                            "Bir Tawil-Sudan",
                            "Bir Tawil-Egypt",
                            "Abyei-Sudan",
                            "W. Sahara-Morocco",
                            "Palestine-Israel"
                            ]);
    /**
     * D3에서 지원하는 다양한 투영법 목록 정의
     * @type {Array<Object>}
     */
    static PROJECTIONS = [
        { name: "Airy’s minimum error", value: d3.geoAiry },
        { name: "Aitoff", value: d3.geoAitoff },
        { name: "Albers", value: d3.geoAlbers },
        { name: "American polyconic", value: d3.geoPolyconic },
        { name: "armadillo", value: d3.geoArmadillo },
        { name: "August", value: d3.geoAugust },
        { name: "azimuthal equal-area", value: d3.geoAzimuthalEqualArea },
        { name: "azimuthal equidistant", value: d3.geoAzimuthalEquidistant },
        { name: "Baker dinomic", value: d3.geoBaker },
        { name: "Berghaus’ star", value: d3.geoBerghaus },
        { name: "Bertin’s 1953", value: d3.geoBertin1953 },
        { name: "Boggs’ eumorphic", value: d3.geoBoggs },
        { name: "Boggs’ eumorphic (interrupted)", value: d3.geoInterruptedBoggs },
        { name: "Bonne", value: d3.geoBonne },
        { name: "Bottomley", value: d3.geoBottomley },
        { name: "Bromley", value: d3.geoBromley },
        { name: "Butterfly (gnomonic)", value: d3.geoPolyhedralButterfly },
        { name: "Butterfly (Collignon)", value: d3.geoPolyhedralCollignon },
        { name: "Butterfly (Waterman)", value: d3.geoPolyhedralWaterman },
        { name: "Collignon", value: d3.geoCollignon },
        { name: "conic equal-area", value: d3.geoConicEqualArea },
        { name: "conic equidistant", value: d3.geoConicEquidistant },
        { name: "Craig retroazimuthal", value: d3.geoCraig },
        { name: "Craster parabolic", value: d3.geoCraster },
        { name: "cylindrical equal-area", value: d3.geoCylindricalEqualArea },
        { name: "cylindrical stereographic", value: d3.geoCylindricalStereographic },
        { name: "Eckert I", value: d3.geoEckert1 },
        { name: "Eckert II", value: d3.geoEckert2 },
        { name: "Eckert III", value: d3.geoEckert3 },
        { name: "Eckert IV", value: d3.geoEckert4 },
        { name: "Eckert V", value: d3.geoEckert5 },
        { name: "Eckert VI", value: d3.geoEckert6 },
        { name: "Eisenlohr conformal", value: d3.geoEisenlohr },
        { name: "Equal Earth", value: d3.geoEqualEarth },
        { name: "Equirectangular (plate carrée)", value: d3.geoEquirectangular },
        { name: "Fahey pseudocylindrical", value: d3.geoFahey },
        { name: "flat-polar parabolic", value: d3.geoMtFlatPolarParabolic },
        { name: "flat-polar quartic", value: d3.geoMtFlatPolarQuartic },
        { name: "flat-polar sinusoidal", value: d3.geoMtFlatPolarSinusoidal },
        { name: "Foucaut’s stereographic equivalent", value: d3.geoFoucaut },
        { name: "Foucaut’s sinusoidal", value: d3.geoFoucautSinusoidal },
        { name: "general perspective", value: d3.geoSatellite },
        { name: "Gilbert’s two-world", value: d3.geoGilbert },
        { name: "Gingery", value: d3.geoGingery },
        { name: "Ginzburg V", value: d3.geoGinzburg5 },
        { name: "Ginzburg VI", value: d3.geoGinzburg6 },
        { name: "Ginzburg VIII", value: d3.geoGinzburg8 },
        { name: "Ginzburg IX", value: d3.geoGinzburg9 },
        { name: "Goode’s homolosine", value: d3.geoHomolosine },
        { name: "Goode’s homolosine (interrupted)", value: d3.geoInterruptedHomolosine },
        { name: "gnomonic", value: d3.geoGnomonic },
        { name: "Gringorten square", value: d3.geoGringorten },
        { name: "Gringorten quincuncial", value: d3.geoGringortenQuincuncial },
        { name: "Guyou square", value: d3.geoGuyou },
        { name: "Hammer", value: d3.geoHammer },
        { name: "Hammer retroazimuthal", value: d3.geoHammerRetroazimuthal },
        { name: "HEALPix", value: d3.geoHealpix },
        { name: "Hill eucyclic", value: d3.geoHill },
        { name: "Hufnagel pseudocylindrical", value: d3.geoHufnagel },
        { name: "Kavrayskiy VII", value: d3.geoKavrayskiy7 },
        { name: "Lagrange conformal", value: d3.geoLagrange },
        { name: "Larrivée", value: d3.geoLarrivee },
        { name: "Laskowski tri-optimal", value: d3.geoLaskowski },
        { name: "Loximuthal", value: d3.geoLoximuthal },
        { name: "Mercator", value: d3.geoMercator },
        { name: "Miller cylindrical", value: d3.geoMiller },
        { name: "Mollweide", value: d3.geoMollweide },
        { name: "Mollweide (Goode’s interrupted)", value: d3.geoInterruptedMollweide },
        { name: "Mollweide (interrupted hemispheres)", value: d3.geoInterruptedMollweideHemispheres },
        { name: "Natural Earth", value: d3.geoNaturalEarth1 },
        { name: "Natural Earth II", value: d3.geoNaturalEarth2 },
        { name: "Nell-Hammer", value: d3.geoNellHammer },
        { name: "Nicolosi globular", value: d3.geoNicolosi },
        { name: "Patterson cylindrical", value: d3.geoPatterson },
        { name: "Peirce quincuncial", value: d3.geoPeirceQuincuncial },
        { name: "rectangular polyconic", value: d3.geoRectangularPolyconic },
        { name: "Robinson", value: d3.geoRobinson },
        { name: "sinusoidal", value: d3.geoSinusoidal },
        { name: "sinusoidal (interrupted)", value: d3.geoInterruptedSinusoidal },
        { name: "sinu-Mollweide", value: d3.geoSinuMollweide },
        { name: "sinu-Mollweide (interrupted)", value: d3.geoInterruptedSinuMollweide },
        { name: "stereographic", value: d3.geoStereographic },
        { name: "Times", value: d3.geoTimes },
        { name: "Tobler hyperelliptical", value: d3.geoHyperelliptical },
        { name: "transverse Mercator", value: d3.geoTransverseMercator },
        { name: "Van der Grinten", value: d3.geoVanDerGrinten },
        { name: "Van der Grinten II", value: d3.geoVanDerGrinten2 },
        { name: "Van der Grinten III", value: d3.geoVanDerGrinten3 },
        { name: "Van der Grinten IV", value: d3.geoVanDerGrinten4 },
        { name: "Wagner IV", value: d3.geoWagner4 },
        { name: "Wagner VI", value: d3.geoWagner6 },
        { name: "Wagner VII", value: d3.geoWagner7 },
        { name: "Werner", value: () => d3.geoBonne().parallel(90) },
        { name: "Wiechel", value: d3.geoWiechel },
        { name: "Winkel tripel", value: d3.geoWinkel3 }
    ];

    /**
     * 분쟁 국가 목록을 배열로 반환합니다. UI에서 호출하여 현재 설정을 읽어올 때 사용.
     * @returns {string[]} 분쟁 국가 쌍 문자열 목록
     */
    static getDisputeCountries() {
        return Array.from(WorldMapGenerator.DISPUTE_COUNTRIES);
    }

    /**
     * 분쟁 국가 쌍을 추가합니다. 중복이 허용되지 않습니다.
     * @param {string} pair "국가1-국가2" 형식 문자열
     */
    static addDisputeCountry(pair) {
        WorldMapGenerator.DISPUTE_COUNTRIES.add(pair);
    }

    /**
     * 분쟁 국가 쌍을 제거합니다.
     * @param {string} pair 제거할 쌍
     */
    static removeDisputeCountry(pair) {
        WorldMapGenerator.DISPUTE_COUNTRIES.delete(pair);
    }

    /**
     * 콜백 함수들
     * @type {Object}
     */
    Callback = {
        /**
         * 옵션이 토글될 때 DOM에 반영하기 위해 호출되는 콜백 함수입니다. 옵션의 인덱스와 새로운 값이 전달됩니다.
         * @param {string} optionName 토글된 옵션의 이름
         * @param {number} index 토글된 옵션의 인덱스
         * @param {boolean} value 토글된 옵션의 새로운 값
         * @param {string} source 메서드 호출 출처
         */
        OptionToggled: (optionName, index, value, source) => {},
        /**
         * WorldMapGenerator의 Type이 바뀔 때 DOM에 반영하기 위해 호출되는 콜백 함수입니다.
         * @param {WorldMapGenerator.GENERATOR_TYPES} type 바뀐 타입
         */
        TypeChanged: (type) => {}
    };

    /**
     * 지도 투영 유형
     * @type {WorldMapGenerator.GENERATOR_TYPES}
     */
    type = WorldMapGenerator.GENERATOR_TYPES.VARIOUS;
    /**
     * 생성될 SVG의 너비 (픽셀 단위)
     * @type {number}
     */
    width = 560;
    /**
     * 생성될 SVG의 높이 (픽셀 단위)
     * @type {number}
     */
    height = 560;
    /**
     * 지도의 정밀도 (D3 geo path precision)
     * @type {number}
     */
    precision = 0.1;
    /**
     * SVG 요소의 DOM ID
     * @type {string|null}
     */
    svgId = null;
    /**
     * 지도 생성 옵션들
     * @type {Object}
     */
    Options = {
        projectLakeReservoir: true,
        squashLakeReservoir: true,
        projectPlateBoundary: false,
        squashPlateBoundary: true,
        projectLand: true,
        squashLand: true,
        projectBorder: false,
        projectUSAStateBorder: false,
        projectChinaProvinceBorder: false,
        projectKoreaBasemap: false,
        projectKoreaSido: false,
        projectKoreaSigMerged: false,
        projectKoreaSig: true,
        projectLongitude: true,
        projectLatitude: true,
        projectEquator: false,
        projectTropicOfCancer: false,
        projectTropicOfCapricorn: false,
        projectNorthernArcticCircle: false,
        projectSouthernArcticCircle: false,
        projectInclination: false,
        projectOceanCurrents: false,
        projectDeepCirculations: false,
        projectSurfaceWater: true,
        projectDeepWater: true,
        projectBottomWater: true,
        projectCulturalBoundary: false
    };
    /**
     * 데이터 로딩 상태 추적 객체
     * @type {Object}
     */
    FetchLoaded = {
        plate: false,
        lake: false,
        states: false,
        statesUSABorder: false,
        provincesChinaBorder: false,
        land: false,
        countries: false,
        countriesBorder: false,
        dokdo: false,
        koreaBasemap: false,
        inclination: false,
        oceanCurrents: false,
        deepCirculations: false,
        culturalBoundary: false
    };
    /**
     * GeoJSON 데이터 객체
     * @type {Object}
     */
    GeoData = {
        plate: null,
        plateSimple: null,
        lake50: null,
        lake110: null,
        statesUSA50: null,
        statesUSA110: null,
        statesUSALower48: null,
        statesUSABorder50: null,
        statesUSABorder110: null,
        provincesChina50: null,
        provincesChinaBorder50: null,
        land10: null,
        land50: null,
        land110: null,
        countries10: null,
        countries50: null,
        countries110: null,
        countriesBorder10: null,
        countriesBorder50: null,
        countriesBorder110: null,
        dokdo50: null,
        dokdo110: null,
        cjk: null,
        kor: null,
        koreaBasemapSigMerged: null,
        koreaBasemapSgi: null,
        koreaBasemapSido: null,
        koreaBasemapSigMergedBorder: null,
        koreaBasemapSigBorder: null,
        koreaBasemapSidoBorder: null,
        inclination: null,
        oceanCurrents: null,
        deepCirculations: null,
        culturalBoundary: null
    }
    /**
     * 사용자 정의 스타일 설정 (기본값은 DefaultCustomStyles에서 복사)
     * @type {Object}
     */
    CustomStyles = Object.assign({}, WorldMapGenerator.DEFAULT_STYLES);

    /**
     * 지도 외곽선 정의 (구형 또는 사각형 등)
     * @type {Object}
     */
    outline = {
        type: "Sphere"
    };
    /**
     * 적도선 GeoJSON 객체
     * @type {Object}
     */
    equator = d3.geoGraticule().step([0, 90])();
    /**
     * 북회귀선 GeoJSON 객체
     * @type {Object}
     */
    tropicOfCancer = d3.geoGraticule()
        .extent([[-180, 23.5], [ 180, 23.5]])
        .step([0, 0])
        .outline();
    /**
     * 남회귀선 GeoJSON 객체
     * @type {Object}
     */
    tropicOfCapricorn = d3.geoGraticule()
        .extent([[-180, -23.5], [ 180, -23.5]])
        .step([0, 0])
        .outline();
    /**
     * 북극권 GeoJSON 객체
     * @type {Object}
     */
    northernArcticCircle = d3.geoGraticule()
        .extent([[-180, 66.5], [ 180, 66.5]])
        .step([0, 0])
        .outline();
    /**
     * 남극권 GeoJSON 객체
     * @type {Object}
     */
    southernArcticCircle = d3.geoGraticule()
        .extent([[-180, -66.5], [ 180, -66.5]])
        .step([0, 0])
        .outline();
    /**
     * 지도 회전 각도 [lambda, phi, gamma]
     * @type {number[]}
     */
    rotate = [0, 0, 0];
    /**
     * 경위도선 간격 설정
     * @type {Object}
     * @property {number} lat 위도선 간격
     * @property {number} long 경도선 간격
     * @property {number} incl 지자기 경사각 간격
     */
    graticules = {
        "lat": 10,
        "long": 10,
        "incl": 10
    };
    /**
     * 사용자가 추가한 원형 도형 목록
     * @type {Array.<{center: number[], radius: number}>}
     */
    circles = [];
    /**
     * 사용자가 추가한 선형 도형 목록
     * @type {Array.<{from: number[], to: number[]}>}
     */
    lines = [];
    /**
     * 선택된 국가들의 이름 집합 (강조 표시용)
     * @type {Set<string>}
     */
    selectedAreas = new Set();
    /**
     * 현재 선택된 도형 추가 모드 ("circle" 또는 "line")
     * @type {string}
     */
    currentShape = "circle";

    // 기본 투영법 설정
    projectionName = "cylindrical stereographic";
    projectionIndex = WorldMapGenerator.PROJECTIONS.find(p => p.name === this.projectionName);
    projection = d3.geoCylindricalStereographic;
    // 기본 다운로드 파일명 설정
    fileName = "varioustype_map.svg"
    
    _usa_projection_cache = {};
    _cjk_projection_cache = {};
    _kor_projection_cache = {};
    _options_before = {};
    _projection_index_before = {};
    _rotate_before = [0, 0, 0];
    _already_alerted = false;

    /**
     * 필요한 GeoJSON 및 TopoJSON 데이터를 비동기적으로 로드합니다.
     */
    initJSON() {
        // 판 경계 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/plate_boundary.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/plate_boundary_simple.geojson").then(response => response.json())
        ])
        .then(([plate, plateSimple]) => {
            this.GeoData.plate = plate;
            this.GeoData.plateSimple = plateSimple;
            this.FetchLoaded.plate = true;
            this.drawSVG(false);
        });
        // 호수 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_lakes.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_lakes.geojson").then(response => response.json())
        ])
            .then(([lake50, lake110]) => {
                this.GeoData.lake50 = lake50;
                this.GeoData.lake110 = lake110;
                this.FetchLoaded.lake = true;
                this.drawSVG(false);
            });
        // 미국(중국) 주(성) 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_states.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_states_usa.topojson").then(response => response.json())
        ])
            .then(([states50, states110]) => {
                let stateData = topojson.feature(states50, states50.objects.states);
                let statesUsaArr = [];
                let statesUsaLower48Arr = [];
                let statesChinaArr = [];
                for (let feature of stateData.features) {
                    if (feature.properties.admin === "United States of America") {
                        statesUsaArr.push(feature);
                        if (!["Alaska", "Hawaii"].includes(feature.properties.name)) {
                            statesUsaLower48Arr.push(feature);
                        }
                    } else if (feature.properties.admin === "China") {
                        statesChinaArr.push(feature);
                    }
                }
                this.GeoData.statesUSA50 = {
                    "type": "FeatureCollection",
                    "features": statesUsaArr
                };
                this.GeoData.provincesChina50 = {
                    "type": "FeatureCollection",
                    "features": statesChinaArr
                }
                this.GeoData.statesUSALower48 = {
                    "type": "FeatureCollection",
                    "features": statesUsaLower48Arr
                };

                this.GeoData.statesUSA50 = topojson.feature(states110, states110.objects.states);
                this.FetchLoaded.states = true;
                this.drawSVG(false);
            });
        // 중국 성 경계 데이터 로드
        fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_provinces_china_border.geojson")
            .then(response => response.json())
            .then((data) => {
                this.GeoData.provincesChinaBorder50 = data;
                this.FetchLoaded.provincesChinaBorder = true;
                this.drawSVG(false);
            });
        
        // 미국 주 경계 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_states_usa_border.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_states_usa_border.geojson").then(response => response.json())
        ])
            .then(([border50, border110]) => {
                this.GeoData.statesUSABorder50 = border50;
                this.GeoData.statesUSABorder110 = border110;
                this.FetchLoaded.statesUSABorder = true;
                this.drawSVG(false);
            });
        // 육지 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_land.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_land.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/10m_land.topojson").then(response => response.json())
        ])
            .then(([land50, land110, land10]) => {
                this.GeoData.land50 = topojson.feature(land50, land50.objects.land);
                this.GeoData.land110 = topojson.feature(land110, land110.objects.land);
                this.GeoData.land10 = topojson.feature(land10, land10.objects.land);
                this.FetchLoaded.land = true;
                this.drawSVG(false);
            });
        // 국가 및 분쟁지역 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_countries.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_dispute.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_countries.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_dispute.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/10m_countries.topojson").then(response => response.json())
        ])
            .then(([countries50, dispute50, countries110, dispute110, countries10]) => {
                this.GeoData.countries50 = topojson.feature(countries50, countries50.objects.countries);
                this.GeoData.cjk = {
                    "type": "FeatureCollection",
                    "features": this.GeoData.countries50.features.filter(f => ["China", "Japan", "South Korea"].includes(f.properties.name))
                };
                this.GeoData.countries50.features.push(...topojson.feature(dispute50, dispute50.objects.countries).features);
                this.GeoData.countries110 = topojson.feature(countries110, countries110.objects.countries);
                this.GeoData.countries110.features.push(...topojson.feature(dispute110, dispute110.objects.countries).features)
                this.GeoData.countries10 = topojson.feature(countries10, countries10.objects.countries);
                this.FetchLoaded.countries = true;
                this.drawSVG(false);
            });
        // 독도 데이터 로드 - 대한민국 영토에 통합
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_dokdo.geojson").then(res => res.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_dokdo.geojson").then(res => res.json())
        ])
            .then(([dokdo50, dokdo110]) => {
                // land, countries가 모두 로드될 때까지 기다리기
                const checkDependencies = setInterval(() => {
                    if (this.FetchLoaded.land && this.FetchLoaded.countries) {
                        clearInterval(checkDependencies);

                        this.GeoData.land50.features.push(...dokdo50.features);
                        this.GeoData.land110.features.push(...dokdo110.features);

                        let addDokdoToCountry = (dokdo, countries) => {
                            let korea = countries.features.find(f => f.properties.name === "South Korea");
                            if (korea) {
                                let combinedCoords = []; // 모든 영토 좌표를 담을 거대한 상자

                                // A. 기존 대한민국 영토를 상자에 넣기
                                if (korea.geometry.type === "Polygon") {
                                    combinedCoords.push(korea.geometry.coordinates);
                                } else if (korea.geometry.type === "MultiPolygon") {
                                    combinedCoords.push(...korea.geometry.coordinates);
                                }

                                // B. 독도의 모든 영토(섬들)를 상자에 추가하기
                                dokdo.features.forEach(f => {
                                    if (f.geometry && f.geometry.type === "Polygon") {
                                        combinedCoords.push(f.geometry.coordinates);
                                    } else if (f.geometry && f.geometry.type === "MultiPolygon") {
                                        combinedCoords.push(...f.geometry.coordinates);
                                    }
                                });

                                // C. 대한민국의 지형 정보를 '통합된 MultiPolygon'으로 덮어쓰기
                                korea.geometry.type = "MultiPolygon";
                                korea.geometry.coordinates = combinedCoords;

                                if (this.GeoData.kor === null) {
                                    this.GeoData.kor = {
                                        "type": "FeatureCollection",
                                        "features": [korea, this.GeoData.countries50.features.find(f => f.properties.name === "North Korea")]
                                    };
                                }
                            }
                        };

                        addDokdoToCountry(dokdo50, this.GeoData.countries50);
                        addDokdoToCountry(dokdo110, this.GeoData.countries110);
                        
                        this.FetchLoaded.dokdo = true;
                        this.drawSVG(false);
                    }
                }, 10);
            });
        // 고화질 한반도 백지도 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sido.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sig.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sig_merged.topojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sido_border.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sig_border.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/korea_sig_merged_border.geojson").then(response => response.json())
        ])
            .then(([koreaSido, koreaSig, koreaSigMerged, koreaSidoBorder, koreaSigBorder, koreaSigMergedBorder]) => {
                this.GeoData.koreaBasemapSigMerged = topojson.feature(koreaSigMerged, koreaSigMerged.objects.sig);
                this.GeoData.koreaBasemapSig = topojson.feature(koreaSig, koreaSig.objects.sig);
                this.GeoData.koreaBasemapSido = topojson.feature(koreaSido, koreaSido.objects.sido);
                
                this.GeoData.koreaBasemapSigMergedBorder = koreaSigMergedBorder;
                this.GeoData.koreaBasemapSigBorder = koreaSigBorder;
                this.GeoData.koreaBasemapSidoBorder = koreaSidoBorder;
                this.FetchLoaded.koreaBasemap = true;
                this.drawSVG(false);
            });
        // 국경선 데이터 로드
        Promise.all([
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/50m_countries_border.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/110m_countries_border.geojson").then(response => response.json()),
            fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/10m_countries_border.geojson").then(response => response.json())
        ])
            .then(([border50, border110, border10]) => {
                this.GeoData.countriesBorder50 = border50;
                this.GeoData.countriesBorder110 = border110;
                this.GeoData.countriesBorder10 = border10;
                this.FetchLoaded.countriesBorder = true;
                this.drawSVG(false);
            });
        // 지자기 경사각 데이터 로드
        fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/inclination.json")
            .then(response => response.json())
            .then((data) => {
                this.inclination = data;
                this.FetchLoaded.inclination = true;
                this.drawSVG(false);
            });
        // 해류 데이터 로드
        fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/ocean_currents.json")
            .then(response => response.json())
            .then((data) => {
                this.GeoData.oceanCurrents = data;
                this.FetchLoaded.oceanCurrents = true;
                this.drawSVG(false);
            });
        // 심층 순환 데이터 로드
        fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/deep_circulations.json")
            .then(response => response.json())
            .then((data) => {
                this.GeoData.deepCirculations = data;
                this.FetchLoaded.deepCirculations = true;
                this.drawSVG(false);
            });
            
        // 문화권 영역 데이터 로드
        fetch("/world-map-demo/resources/orion/tools/vectormap/data/new/plate_boundary.geojson")
            .then(response => response.json())
            .then((data) => {
                this.GeoData.culturalBoundary = data;
                this.FetchLoaded.culturalBoundary = true;
                this.drawSVG(false);
            });
    }

    /**
     * 지도 생성기의 유형을 설정합니다.
     * @param {WorldMapGenerator.GENERATOR_TYPES} type 도법 유형
     */
    setType(type) {
        this.resetZoom();
        switch (type) {
            case WorldMapGenerator.GENERATOR_TYPES.SPHERE:
                this.projectionName = "Orthographic";
                this.projectionIndex = -1;
                this.projection = d3.geoOrthographic;
                this.fileName = "spheretype_map.svg"
                break;
            case WorldMapGenerator.GENERATOR_TYPES.VARIOUS:
                if (this.type !== WorldMapGenerator.GENERATOR_TYPES.VARIOUS) {
                    this.setProjection(WorldMapGenerator.PROJECTIONS[this._projection_index_before].name);
                    const keys = Object.keys(this.Options);
                    for (let i = 0; i < keys.length; i++) {
                        const optionName = keys[i];
                        this.toggleOption({option: optionName, value: this._options_before[optionName], draw: i === keys.length-1});
                    }
                    this.rotate = [...this._rotate_before];
                } else {
                    this.setProjection("cylindrical stereographic");
                }
                this.fileName = "varioustype_map.svg"
                break;
            case WorldMapGenerator.GENERATOR_TYPES.USA:
                this._projection_index_before = this.projectionIndex;
                this._options_before = Object.assign({}, this.Options);
                this._rotate_before = [...this.rotate];
                this.setProjection("Albers");
                this.toggleOption({option: "projectLakeReservoir", value: true, draw: false});
                this.toggleOption({option: "squashLakeReservoir", value: false, draw: false});
                this.toggleOption({option: "projectLand", value: true, draw: false});
                this.toggleOption({option: "projectBorder", value: true, draw: false});
                this.toggleOption({option: "projectUSAStateBorder", value: true, draw: false});
                this.toggleOption({option: "squashLand", value: false});
                this.fileName = "USAtype_map.svg"
                break;
            case WorldMapGenerator.GENERATOR_TYPES.CJK:
                this._projection_index_before = this.projectionIndex;
                this._options_before = Object.assign({}, this.Options);
                this._rotate_before = [...this.rotate];
                this.setProjection("Mercator");
                this.toggleOption({option: "projectLakeReservoir", value: true, draw: false});
                this.toggleOption({option: "squashLakeReservoir", value: false, draw: false});
                this.toggleOption({option: "projectLand", value: true, draw: false});
                this.toggleOption({option: "projectBorder", value: true, draw: false});
                this.toggleOption({option: "projectChinaProvinceBorder", value: true, draw: false});
                this.toggleOption({option: "squashLand", value: false});
                this.fileName = "CJKtype_map.svg"
                break;
            case WorldMapGenerator.GENERATOR_TYPES.KOR:
                this._projection_index_before = this.projectionIndex;
                this._options_before = Object.assign({}, this.Options);
                this._rotate_before = [...this.rotate];
                this.setProjection("Mercator");
                this.toggleOption({option: "projectLakeReservoir", value: false, draw: false});
                this.toggleOption({option: "projectLand", value: true, draw: false});
                this.toggleOption({option: "projectBorder", value: true, draw: false});
                this.toggleOption({option: "projectChinaProvinceBorder", value: false, draw: false});
                this.toggleOption({option: "projectKoreaBasemap", value: true, draw: false});
                this.toggleOption({option: "projectKoreaSido", value: false, draw: false});
                this.toggleOption({option: "projectKoreaSigMerged", value: false, draw: false});
                this.toggleOption({option: "projectKoreaSig", value: true, draw: false});
                this.toggleOption({option: "squashLand", value: false});
                this.fileName = "KORtype_map.svg"
                break;
        }
        this.type = type;
        this.Callback.TypeChanged(this.type);
    }

    /**
     * SVG 요소의 ID를 설정하고 줌 기능을 활성화하며 데이터를 초기화합니다.
     * @param {string} elementId SVG 요소의 ID
     */
    setSvgElementId(elementId) {
        this.svgId = elementId;

        const svg = d3.select(`#${this.svgId}`);
        // 줌 기능 설정 (확대/축소 범위: 1배 ~ 75배)
        const zoom = d3.zoom()
            .scaleExtent([1, 75])
            .on("zoom", (event) => {
                // 줌 이벤트 발생 시 그룹 요소(g)에 변환 적용
                svg.select("g").attr("transform", event.transform);
            });
        svg.call(zoom);
        // zoom 인스턴스를 보관해두면 나중에 원상복구할 수 있음
        this._zoomBehavior = zoom;

        // 지도 데이터 로드 시작
        this.initJSON();
    }

    /**
     * 현재 투영법을 사용하여 GeoJSON 데이터를 SVG 경로 데이터(d 속성값)로 변환합니다.
     * @param {...Object} args GeoJSON 객체들
     * @returns {string} SVG path 문자열
     */
    path(...args) {
        return d3.geoPath(this.getProjection()).apply(null, args);
    }

    /**
     * 경위도선 및 지자기 경사각의 간격을 설정합니다.
     * @param {number|string} lat 위도선 간격
     * @param {number|string} long 경도선 간격
     * @param {number|string} incl 지자기 경사각 간격
     */
    setGraticules(lat, long, incl) {
        this.graticules.lat = parseInt(lat, 10);
        this.graticules.long = parseInt(long, 10);
        this.graticules.incl = parseInt(incl, 10);
    }

    /**
     * 지도의 회전 각도를 설정합니다.
     * @param {number|string} lambda 람다 (경도 회전)
     * @param {number|string} phi 파이 (위도 회전)
     * @param {number|string} gamma 감마 (롤 회전)
     */
    setRotate(lambda, phi, gamma) {
        this.rotate = [parseFloat(lambda), parseFloat(phi), parseFloat(gamma)];
    }

    /**
     * 현재 설정된 투영법 객체를 반환합니다.
     * 화면 크기에 맞게 크기를 조정하고 회전 및 정밀도를 적용합니다.
     * @returns {d3.geoProjection} D3 투영 객체
     */
    getProjection() {
        if (this.type === WorldMapGenerator.GENERATOR_TYPES.USA) {
            if (this._usa_projection_cache.hasOwnProperty(this.projectionName)) {
                return this._usa_projection_cache[this.projectionName];
            }
            if (this.projectionName !== "Albers") {
                this._usa_projection_cache[this.projectionName] = this.projection()
                    .rotate([96, 0])
                    .fitExtent([
                        [10, 10],
                        [this.width - 10, this.height - 10]
                    ], this.GeoData.statesUSALower48)
                    .precision(this.precision)
                    .clipExtent([[5, 5], [this.width - 5, this.height - 5]]);
            } else {
                this._usa_projection_cache[this.projectionName] = this.projection()
                    .fitExtent([
                        [10, 10],
                        [this.width - 10, this.height - 10]
                    ], this.GeoData.statesUSALower48)
                    .precision(this.precision)
                    .clipExtent([[5, 5], [this.width - 5, this.height - 5]]);
            }
            return this._usa_projection_cache[this.projectionName];
        }

        if (this.type === WorldMapGenerator.GENERATOR_TYPES.CJK) {
            if (this._cjk_projection_cache.hasOwnProperty(this.projectionName)) {
                return this._cjk_projection_cache[this.projectionName];
            }
            this._cjk_projection_cache[this.projectionName] = this.projection()
                .rotate([-105, 0])
                .fitExtent([
                    [10, 10],
                    [this.width - 10, this.height - 10]
                ], this.GeoData.cjk)
                .precision(this.precision)
                .clipExtent([[5, 5], [this.width - 5, this.height - 5]]);
            return this._cjk_projection_cache[this.projectionName];
        }

        if (this.type === WorldMapGenerator.GENERATOR_TYPES.KOR) {
            if (this._kor_projection_cache.hasOwnProperty(this.projectionName)) {
                return this._kor_projection_cache[this.projectionName];
            }
            this._kor_projection_cache[this.projectionName] = this.projection()
                .rotate([-105, 0])
                .fitExtent([
                    [10, 10],
                    [this.width - 10, this.height - 10]
                ], this.GeoData.kor)
                .precision(this.precision)
                .clipExtent([[5, 5], [this.width - 5, this.height - 5]]);
            return this._kor_projection_cache[this.projectionName];
        }

        return this.projection()
            .rotate(this.rotate)
            .fitExtent([
                [10, 10],
                [this.width - 10, this.height - 10]
            ], this.outline)
            .precision(this.precision);
    }

    /**
     * 투영법을 설정합니다.
     * @param {string} projectionName 
     */
    setProjection(projectionName) {
        const found = WorldMapGenerator.PROJECTIONS.find(p => p.name === projectionName);
        if (found) {
            this.projectionName = found.name;
            this.projectionIndex = WorldMapGenerator.PROJECTIONS.indexOf(found);
            this.projection = found.value;
        }
    }

    /**
     * 육지 데이터를 반환합니다. 옵션에 따라 상세/간소화 데이터 및 국경선 포함 여부를 결정합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getLandForPath(forceSquash) {
        if (this.Options.squashLand || forceSquash)
            return this.GeoData.land110;
        else if (this.type === WorldMapGenerator.GENERATOR_TYPES.KOR)
            return this.GeoData.land10;
        else
            return this.GeoData.land50;
    }

    /**
     * 미국 주 데이터를 반환합니다. 옵션에 따라 상세/간소화 데이터 및 국경선 포함 여부를 결정합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getUSAStatesForPath(forceSquash) {
        if (this.Options.squashLand || forceSquash)
            return this.GeoData.statesUSA50;
        else
            return this.GeoData.statesUSA50;
    }

    /**
     * 미국 주 경계선 데이터를 반환합니다. 옵션에 따라 상세/간소화 데이터 및 국경선 포함 여부를 결정합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getUSAStatesBorderForPath(forceSquash) {
        if (this.Options.squashLand || forceSquash)
            return this.GeoData.statesUSABorder110;
        else
            return this.GeoData.statesUSABorder50;
    }

    /**
     * 중국 성 데이터를 반환합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getChinaProvincesForPath() {
        return this.GeoData.provincesChina50;
    }

    /**
     * 중국 성 경계선 데이터를 반환합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getChinaProvincesBorderForPath() {
        return this.GeoData.provincesChinaBorder50;
    }

    /**
     * 대한민국 행정구역 데이터를 반환합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getKoreaBasemapForPath() {
        if (this.Options.projectKoreaSido)
            return this.GeoData.koreaBasemapSido;
        else if (this.Options.projectKoreaSig)
            return this.GeoData.koreaBasemapSig;
        else
            return this.GeoData.koreaBasemapSigMerged;
    }

    /**
     * 대한민국 행정구역 경계선 데이터를 반환합니다.
     * @param {boolean} [forceSido] 강제로 시도 경계선을 반환할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getKoreaBasemapBorderForPath(forceSido = false) {
        if (forceSido)
            return this.GeoData.koreaBasemapSidoBorder;

        if (this.Options.projectKoreaSido)
            return this.GeoData.koreaBasemapSidoBorder;
        else if (this.Options.projectKoreaSig)
            return this.GeoData.koreaBasemapSigBorder;
        else
            return this.GeoData.koreaBasemapSigMergedBorder;
    }

    /**
     * 국가 데이터를 반환합니다. 옵션에 따라 상세/간소화 데이터 및 국경선 포함 여부를 결정합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getCountriesForPath(forceSquash) {
        if (this.Options.squashLand || forceSquash)
            return this.GeoData.countries110;
        else if (this.type === WorldMapGenerator.GENERATOR_TYPES.KOR)
            return this.GeoData.countries10;
        else
            return this.GeoData.countries50;
    }

    /**
     * 국경선 데이터를 반환합니다. 옵션에 따라 상세/간소화 데이터 및 국경선 포함 여부를 결정합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getCountryBoundaryForPath(forceSquash) {
        if (this.Options.squashLand || forceSquash)
            return this.GeoData.countriesBorder110;
        else if (this.type === WorldMapGenerator.GENERATOR_TYPES.KOR)
            return this.GeoData.countriesBorder10;
        else
            return this.GeoData.countriesBorder50;
    }

    /**
     * 호수/저수지 데이터를 반환합니다.
     * @param {boolean} forceSquash 강제로 간소화된 데이터를 사용할지 여부
     * @returns {Object} GeoJSON FeatureCollection
     */
    getLakeReservoirForPath(forceSquash) {
        if (this.Options.squashLakeReservoir || forceSquash)
            return this.GeoData.lake110;
        else
            return this.GeoData.lake50;
    }

    /**
     * 판 경계 데이터를 반환합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getPlateBoundaryForPath() {
        if (this.Options.squashPlateBoundary)
            return this.GeoData.plateSimple;
        else
            return this.GeoData.plate;
    }

    /**
     * 문화권 영역 데이터를 반환합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getCulturalBoundaryForPath() {
        return this.GeoData.culturalBoundary;
    }

    /**
     * 경도선 그리드 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getLongitudeForPath() {
        return d3.geoGraticule().step([parseInt(this.graticules.long, 10), 0])();
    }

    /**
     * 위도선 그리드 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getLatitudeForPath() {
        return d3.geoGraticule().step([0, parseInt(this.graticules.lat, 10)])();
    }

    /**
     * 적도선 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getEquatorForPath() {
        return this.equator;
    }

    /**
     * 북회귀선 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getTropicOfCancerForPath() {
        return this.tropicOfCancer;
    }

    /**
     * 남회귀선 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getTropicOfCapricornForPath() {
        return this.tropicOfCapricorn;
    }

    /**
     * 북극권 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getNorthernArcticCircle() {
        return this.northernArcticCircle;
    }

    /**
     * 남극권 데이터를 반환합니다.
     * @returns {Object} GeoJSON MultiLineString
     */
    getSouthernArcticCircle() {
        return this.southernArcticCircle;
    }

    /**
     * 지자기 경사각 데이터를 반환합니다. 설정된 간격에 맞는 등치선만 필터링합니다.
     * @returns {Object} GeoJSON FeatureCollection
     */
    getInclinationForPath() {
        const features = this.inclination.features.filter((e) => {
            return e.properties.Contour % this.graticules.incl === 0;
        });
        return { "type": "FeatureCollection", "features": features };
    }

    /**
     * 해류 데이터를 반환합니다.
     * @param {string} temp 해류 온도 ("warm" 또는 "cold")
     * @returns {Object} GeoJSON FeatureCollection
     */
    getOceanCurrentsForPath(temp) {
        const features = this.GeoData.oceanCurrents.features.filter((e) => {
            return e.properties.TEMP === temp;
        });
        return { "type": "FeatureCollection", "features": features };
    }

    /**
     * 심층 순환 데이터를 반환합니다.
     * @param {string} level 순환 깊이 ("surface", "deep", "bottom")
     * @returns {Object} GeoJSON FeatureCollection
     */
    getDeepCirculationsForPath(level) {
        const features = this.GeoData.deepCirculations.features.filter((e) => {
            return e.properties.LEVEL === level;
        });
        return { "type": "FeatureCollection", "features": features };
    }

    /**
     * 두 국가 간의 분쟁 지역 여부를 확인합니다. 국가 이름이 "country1-country2" 또는 "country2-country1" 형식으로 DISPUTE_COUNTRIES 집합에 존재하는지 검사합니다.
     * @param {Array.<{country1:string, country2:string}>} countries 
     * @returns {boolean} 두 국가가 분쟁 지역으로 간주되는지 여부
     */
    isDisputeBorder(countries) {
        if (WorldMapGenerator.DISPUTE_COUNTRIES.has(countries.join("-")))
            return true;
        else if (WorldMapGenerator.DISPUTE_COUNTRIES.has(countries.reverse().join("-")))
            return true;
        else
            return false;
    }

    /**
     * 국가 클릭 시 테두리 굵기를 토글하고 선택 상태를 관리합니다.
     * @param {Element} element 클릭된 SVG path 요소
     */
    toggleCountryStroke(element) {
        if (!this.Options.projectBorder)
            return;

        const feature = d3.select(element).datum();
        let sido = (feature.properties.hasOwnProperty("sido") ? feature.properties.sido : "");
        let name = feature.properties.name;
        if (sido !== "" && sido !== name)
            name = sido + " " + name;

        if (this.selectedAreas.has(name)) {
            // 선택 해제: 굵기 원복 및 DOM 순서 맨 뒤로(또는 적절한 위치로) 이동
            this.selectedAreas.delete(name);
            element.setAttribute("stroke", "none");
            element.setAttribute("fill", this.CustomStyles.landFillColor);
        } else {
            // 선택: 굵게 표시 및 DOM 순서 맨 앞으로 이동 (가장 나중에 그려짐)
            this.selectedAreas.add(name);
            element.setAttribute("stroke", this.CustomStyles.selectedCountryStrokeColor);
            element.setAttribute("stroke-width", this.CustomStyles.selectedCountryStrokeWidth);
            element.setAttribute("fill", this.CustomStyles.selectedCountryFillColor);
        }

        this.drawSVG(false);
    }

    /**
     * 추가된 도형(원, 선)을 삭제합니다.
     * @param {Element} element 삭제할 도형의 SVG 요소
     */
    deleteShape(element) {
        let temp = element.id.split("-");
        let index = parseInt(temp[1], 10);
        if (temp[0] === "circle")
            this.circles.splice(index, 1);
        else if (temp[0] === "line")
            this.lines.splice(index, 1);

        this.drawSVG(false);
    }

    /**
     * 줌 상태를 초기화합니다. SVG의 zoomBehavior를 사용해 변환을 리셋하고
     * canvas도 함께 다시 그립니다.
     */
    resetZoom() {
        const svg = d3.select(`#${this.svgId}`);
        if (this._zoomBehavior) {
            svg.transition().duration(0).call(this._zoomBehavior.transform, d3.zoomIdentity);
        } else {
            svg.select("g").attr("transform", d3.zoomIdentity);
        }
        this.drawSVG(false);
    }

    /**
     * 모든 추가된 도형을 삭제합니다.
     */
    deleteAllShapes() {
        this.circles = [];
        this.lines = [];

        this.drawSVG(false);
    }

    /**
     * 지도에 원을 추가합니다.
     * @param {number|string} centerLat 중심 위도
     * @param {number|string} centerLong 중심 경도
     * @param {number|string} radius 반지름 (도 단위)
     */
    addCircle(centerLat, centerLong, radius) {
        const center = [parseFloat(centerLong), parseFloat(centerLat)];
        this.circles.push({ "center": center, "radius": radius });

        this.drawSVG(false);
    }

    /**
     * 지도에 선(대원)을 추가합니다.
     * @param {number|string} fromLat 시작 위도
     * @param {number|string} fromLong 시작 경도
     * @param {number|string} toLat 끝 위도
     * @param {number|string} toLong 끝 경도
     */
    addLine(fromLat, fromLong, toLat, toLong) {
        let from = [fromLong, fromLat];
        let to = [toLong, toLat];
        this.lines.push({ "from": from, "to": to });

        this.drawSVG(false);
    }

    /**
     * 지도 표시 옵션을 토글합니다. Callback.OptionToggled을 호출하여 변경된 옵션 정보를 전달합니다.
     * @param {number|string} option 옵션 인덱스 또는 옵션 이름
     * @param {boolean} [value] 강제로 설정할 옵션 값
     * @param {boolean} [draw=true] SVG를 다시 그릴지 여부
     * @param {string} [source="api"] 메서드 호출 출처
     */
    toggleOption({option, value, draw = true, source = "api"} = {}) {
        let optionIndex, optionName;
        // option이 index일 때
        if (typeof option === "number") {
            optionIndex = option;
            optionName = Object.keys(this.Options)[optionIndex];
        // option이 name일 때
        } else if (typeof option === "string") {
            optionIndex = Object.keys(this.Options).indexOf(option);
            optionName = option;
        }
        if (typeof value === "boolean")
            this.Options[optionName] = value;
        else
            this.Options[optionName] = !this.Options[optionName];

        this.Callback.OptionToggled(optionName, optionIndex, this.Options[optionName], source);

        if (draw)
            this.drawSVG(false);
    }

    /**
     * CustomStyles를 수정합니다.
     * @param {string} key 수정할 스타일 키
     * @param {string} value 수정할 스타일 값
     * @param {boolean}} forceSquash 강제로 저해상도 데이터를 사용할지 여부 (성능 최적화용)
     */
    setCustomStyle(key, value, forceSquash) {
        this.CustomStyles[key] = value;

        this.drawSVG(forceSquash);
    }

    /**
     * CustomStyles를 기본 상태로 초기화합니다.
     */
    setDefaultCustomStyles() {
        this.CustomStyles = Object.assign({}, WorldMapGenerator.DEFAULT_STYLES);

        this.drawSVG(false);
    }

    /**
     * 선택된 지역을 모두 해제합니다. 선택된 지역 집합을 초기화하고 지도를 다시 그립니다.
     */
    deselectAllAreas() {
        this.selectedAreas.clear();
        this.drawSVG(false);
    }

    /**
     * SVG 지도를 그립니다.
     * @param {boolean} forceSquash 강제로 저해상도 데이터를 사용할지 여부 (성능 최적화용)
     */
    drawSVG(forceSquash) {
        // 모든 데이터가 로드되었는지 확인
        if (Object.keys(this.FetchLoaded).some(e => {
            return this.FetchLoaded[e] === false;
        }))
            return;
        
        const svg = d3.select(`#${this.svgId}`);
        if (forceSquash) {
            this.drawCanvas();
            return;
        }
        const canvas = document.getElementById(this.svgId.replace("svg", "canvas"));
        canvas.style.display = 'none';
        svg.node().style.display = 'block';
        svg.html(null); // 기존 내용 지우기
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("width", this.width)
            .attr("height", this.height)
            .style("display", "block");

        // 줌 기능을 위한 그룹 요소 생성
        const motherGroup = svg.append("g");
        const group = motherGroup.append("g");
        const transform = d3.zoomTransform(svg.node());
        motherGroup.attr("transform", transform);

        // 배경(바다 등) 그리기
        group.append("path")
            .attr("id", "바다")
            .attr("d", this.path(this.outline))
            .attr("fill", this.CustomStyles.oceanFillColor)
            .attr("stroke", "none");

        if (this.type !== WorldMapGenerator.GENERATOR_TYPES.SPHERE) {
            svg.append("clipPath")
                .attr("id", "clip")
                .append("path")
                .attr("d", this.path(this.outline));

            group.attr("clip-path", "url(#clip)");
        }

        if (this.Options.projectLand) {
            if (!this.Options.projectBorder) {
                // 육지 데이터만 렌더링
                group.append("g")
                    .attr("id", "육지")
                    .selectAll("path")
                    .data(this.getLandForPath(forceSquash).features)
                    .enter()
                    .append("path")
                    .attr("d", (d) => this.path(d))
                    .attr("fill", this.CustomStyles.landFillColor)
                    .attr("stroke", this.CustomStyles.landStrokeColor)
                    .attr("stroke-width", this.CustomStyles.landStrokeWidth)
                    .attr("stroke-linejoin", "round")
            }

            if (this.Options.projectBorder) {
                // 선택된 국가가 나중에 그려지도록 정렬
                const features = this.getCountriesForPath(forceSquash).features.slice().sort((a, b) => {
                    const nameA = a.properties.name;
                    const nameB = b.properties.name;
                    const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                    const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                    return selectedA - selectedB;
                });

                group.append("g")
                    .attr("id", "국가")
                    .selectAll("path")
                    .data(features)
                    .enter()
                    .append("path")
                    .attr("id", (d) => d.properties.name)
                    .attr("d", (d) => this.path(d))
                    .attr("fill", (s) => {
                        return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                    })
                    .attr("stroke", (s) => {
                        return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryStrokeColor : "none";
                    })
                    .attr("stroke-width", this.CustomStyles.selectedCountryStrokeWidth)
                    .attr("onclick", "generator.toggleCountryStroke(this)")
                    .append("title") 
                    .text((s) => s.properties.name);
                
                // 미국 주 경계선 렌더링
                if (this.Options.projectUSAStateBorder) {
                    // 선택된 주가 나중에 그려지도록 정렬
                    const features = this.getUSAStatesForPath(forceSquash).features.slice().sort((a, b) => {
                        const nameA = a.properties.name;
                        const nameB = b.properties.name;
                        const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                        const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                        return selectedA - selectedB;
                    });

                    group.append("g")
                        .attr("id", "미국 주")
                        .selectAll("path")
                        .data(features)
                        .enter()
                        .append("path")
                        .attr("id", (d) => d.properties.name)
                        .attr("d", (d) => this.path(d))
                        .attr("fill", (s) => {
                            return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                        })
                        .attr("stroke", (s) => {
                            return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryStrokeColor : "none";
                        })
                        .attr("stroke-width", this.CustomStyles.selectedCountryStrokeWidth)
                        .attr("onclick", "generator.toggleCountryStroke(this)")
                        .append("title") 
                        .text((s) => (s.properties.name_ko + " 주"));

                    group.append("g")
                        .attr("id", "미국 주 경계")
                        .selectAll("path")
                        .data(this.getUSAStatesBorderForPath(forceSquash).features)
                        .enter()
                        .append("path")
                        .attr("d", (d) => this.path(d))
                        .attr("fill", "none")
                        .attr("stroke", this.CustomStyles.borderStrokeColor)
                        .attr("stroke-width", this.CustomStyles.borderStrokeWidth)
                        .attr("stroke-dasharray", this.CustomStyles.borderStrokeDash)
                        .attr("stroke-linejoin", "round");
                }

                // 중국 성 경계선 렌더링
                if (this.Options.projectChinaProvinceBorder && !this.Options.squashLand) {
                    // 선택된 성이 나중에 그려지도록 정렬
                    const features = this.getChinaProvincesForPath().features.slice().sort((a, b) => {
                        const nameA = a.properties.name;
                        const nameB = b.properties.name;
                        const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                        const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                        return selectedA - selectedB;
                    });

                    group.append("g")
                        .attr("id", "중국 성")
                        .selectAll("path")
                        .data(features)
                        .enter()
                        .append("path")
                        .attr("id", (d) => d.properties.name)
                        .attr("d", (d) => this.path(d))
                        .attr("fill", (s) => {
                            return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                        })
                        .attr("stroke", (s) => {
                            return this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryStrokeColor : "none";
                        })
                        .attr("stroke-width", this.CustomStyles.selectedCountryStrokeWidth)
                        .attr("onclick", "generator.toggleCountryStroke(this)")
                        .append("title") 
                        .text((s) => (s.properties.name_ko));

                    group.append("g")
                        .attr("id", "중국 성 경계")
                        .selectAll("path")
                        .data(this.getChinaProvincesBorderForPath().features)
                        .enter()
                        .append("path")
                        .attr("d", (d) => this.path(d))
                        .attr("fill", "none")
                        .attr("stroke", this.CustomStyles.borderStrokeColor)
                        .attr("stroke-width", this.CustomStyles.borderStrokeWidth)
                        .attr("stroke-dasharray", this.CustomStyles.borderStrokeDash)
                        .attr("stroke-linejoin", "round");
                }

                // 대한민국 행정구역 경계선 렌더링
                if (this.Options.projectKoreaBasemap && !this.Options.squashLand) {
                    const nameFunc = (d) => {
                        let sido = (d.properties.hasOwnProperty("sido") ? d.properties.sido : "");
                        let name = d.properties.name;
                        if (sido !== "" && sido === name)
                            return name;
                        else
                            return sido + " " + name;
                    }
                    // 선택된 행정구역이 나중에 그려지도록 정렬
                    const features = this.getKoreaBasemapForPath().features.slice().sort((a, b) => {
                        const nameA = nameFunc(a);
                        const nameB = nameFunc(b);
                        const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                        const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                        return selectedA - selectedB;
                    });

                    group.append("g")
                        .attr("id", "대한민국 행정구역")
                        .selectAll("path")
                        .data(features)
                        .enter()
                        .append("path")
                        .attr("id", (d) => nameFunc(d))
                        .attr("d", (d) => this.path(d))
                        .attr("fill", (s) => {
                            return this.selectedAreas.has(nameFunc(s)) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                        })
                        .attr("stroke", (s) => {
                            return this.selectedAreas.has(nameFunc(s)) ? this.CustomStyles.selectedCountryStrokeColor : "none";
                        })
                        .attr("stroke-width", this.CustomStyles.selectedCountryStrokeWidth)
                        .attr("onclick", "generator.toggleCountryStroke(this)")
                        .append("title")
                        .text((s) => nameFunc(s));

                    group.append("g")
                        .attr("id", "대한민국 행정구역 경계선")
                        .selectAll("path")
                        .data(this.getKoreaBasemapBorderForPath().features)
                        .enter()
                        .append("path")
                        .attr("d", (d) => this.path(d))
                        .attr("fill", "none")
                        .attr("stroke", this.CustomStyles.borderStrokeColor)
                        .attr("stroke-width", this.CustomStyles.borderStrokeWidth)
                        .attr("stroke-dasharray", this.CustomStyles.borderStrokeDash)
                        .attr("stroke-linejoin", "round");

                    if (this.Options.projectKoreaSig || this.Options.projectKoreaSigMerged)
                        group.append("g")
                            .attr("id", "대한민국 행정구역 시도단위 경계선")
                            .selectAll("path")
                            .data(this.getKoreaBasemapBorderForPath(true).features)
                            .enter()
                            .append("path")
                            .attr("d", (d) => this.path(d))
                            .attr("fill", "none")
                            .attr("stroke", this.CustomStyles.borderStrokeColor)
                            .attr("stroke-width", this.CustomStyles.borderStrokeWidth)
                            .attr("stroke-linejoin", "round");
                }

                // 국가 및 분쟁지역 경계선 렌더링
                group.append("g")
                    .attr("id", "국가 경계선")
                    .selectAll("path")
                    .data(this.getCountryBoundaryForPath(forceSquash).features)
                    .enter()
                    .append("path")
                    .attr("d", (d) => this.path(d))
                    .attr("fill", "none")
                    .attr("stroke", (s)=> {
                        return this.isDisputeBorder(s.properties.countries) ? this.CustomStyles.disputeBorderStrokeColor : this.CustomStyles.borderStrokeColor;
                    })
                    .attr("stroke-width", (s)=> {
                        return this.isDisputeBorder(s.properties.countries) ? this.CustomStyles.disputeBorderStrokeWidth : this.CustomStyles.borderStrokeWidth;
                    })
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-dasharray", (s)=> {
                        return this.isDisputeBorder(s.properties.countries) ? this.CustomStyles.disputeBorderStrokeDash : this.CustomStyles.borderStrokeDash;
                    })
                    .text((s) => s.properties.countries.join("-"));
                    
                // 육지 데이터는 테두리만 렌더링
                group.append("path")
                    .attr("id", "육지 경계선")
                    .attr("d", this.path(this.getLandForPath(forceSquash)))
                    .attr("fill", "none")
                    .attr("stroke", this.CustomStyles.landStrokeColor)
                    .attr("stroke-width", this.CustomStyles.landStrokeWidth)
                    .attr("stroke-linejoin", "round")
            }
        }

        if (this.Options.projectLakeReservoir) {
            group.append("g")
                .attr("id", "호수 및 저수지")
                .selectAll("path")
                .data(this.getLakeReservoirForPath(forceSquash).features)
                .enter()
                .append("path")
                .attr("id", (d) => d.properties.name ? d.properties.name : "")
                .attr("d", (d) => this.path(d))
                .attr("fill", this.CustomStyles.lakeFillColor)
                .attr("stroke", this.CustomStyles.lakeStrokeColor)
                .attr("stroke-width", this.CustomStyles.lakeStrokeWidth)
                .attr("stroke-linejoin", "round")
                .append("title")
                .text((s) => s.properties.name);
        }

        if (this.Options.projectPlateBoundary)
            group.append("path")
                .attr("id", "판의 경계")
                .attr("d", this.path(this.getPlateBoundaryForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt")
                .attr("stroke-linejoin", "round");

        if (this.Options.projectInclination)
            group.append("path")
                .attr("id", "등복각선")
                .attr("d", this.path(this.getInclinationForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt")
                .attr("stroke-linejoin", "round");

        if (this.Options.projectOceanCurrents) {
            const oceanCurrents = group.append("g").attr("id", "표층해류");
            oceanCurrents.append("path")
                .attr("id", "난류")
                .attr("d", this.path(this.getOceanCurrentsForPath("warm")))
                .attr("fill", "none")
                .attr("stroke", "#f00")
                .attr("stroke-width", "0.7pt")
                .attr("stroke-linejoin", "round");
            oceanCurrents.append("path")
                .attr("id", "한류")
                .attr("d", this.path(this.getOceanCurrentsForPath("cold")))
                .attr("fill", "none")
                .attr("stroke", "#00f")
                .attr("stroke-width", "0.7pt")
                .attr("stroke-linejoin", "round");
        }

        if (this.Options.projectDeepCirculations) {
            const deepCirculations = group.append("g").attr("id", "심층순환");
            if (this.Options.projectBottomWater)
                deepCirculations.append("path")
                    .attr("id", "저층수")
                    .attr("d", this.path(this.getDeepCirculationsForPath("bottom")))
                    .attr("fill", "none")
                    .attr("stroke", "#bbb")
                    .attr("stroke-width", "0.7pt")
                    .attr("stroke-linejoin", "round");
            if (this.Options.projectDeepWater)
                deepCirculations.append("path")
                    .attr("id", "심층수")
                    .attr("d", this.path(this.getDeepCirculationsForPath("deep")))
                    .attr("fill", "none")
                    .attr("stroke", "#666")
                    .attr("stroke-width", "0.7pt")
                    .attr("stroke-linejoin", "round");
            if (this.Options.projectSurfaceWater)
                deepCirculations.append("path")
                    .attr("id", "표층수")
                    .attr("d", this.path(this.getDeepCirculationsForPath("surface")))
                    .attr("fill", "none")
                    .attr("stroke", "#000")
                    .attr("stroke-width", "0.7pt")
                    .attr("stroke-linejoin", "round");
        }

        if (this.Options.projectCulturalBoundary) {
            group.append("g")
                .attr("id", "문화권 영역")
                .selectAll("path")
                .data(this.getCulturalBoundaryForPath().features)
                .enter()
                .append("path")
                .attr("d", (d) => this.path(d))
                .attr("fill", "none")
                .attr("stroke", this.CustomStyles.culturalBoundaryStrokeColor)
                .attr("stroke-width", this.CustomStyles.culturalBoundaryStrokeWidth)
                .attr("stroke-linejoin", "round");
        }

        let graticules;
        if (this.Options.projectLatitude || this.Options.projectLongitude)
            graticules = group.append("g").attr("id", "위경도");

        if (this.Options.projectLatitude)
            graticules.append("path")
                .attr("id", "위도선")
                .attr("d", this.path(this.getLatitudeForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.3pt")
                .attr("stroke-dasharray", "1.5 1");

        if (this.Options.projectLongitude)
            graticules.append("path")
                .attr("id", "경도선")
                .attr("d", this.path(this.getLongitudeForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.3pt")
                .attr("stroke-dasharray", "1.5 1");

        if (this.Options.projectEquator 
            && ((this.type === WorldMapGenerator.GENERATOR_TYPES.SPHERE && Math.abs(this.rotate[1]) !== 90)
            || this.type === WorldMapGenerator.GENERATOR_TYPES.VARIOUS))
            group.append("path")
                .attr("id", "적도선")
                .attr("d", this.path(this.getEquatorForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");

        if (this.Options.projectTropicOfCancer) {
            group.append("path")
                .attr("id", "북회귀선")
                .attr("d", this.path(this.getTropicOfCancerForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");
        }

        if (this.Options.projectTropicOfCapricorn) {
            group.append("path")
                .attr("id", "남회귀선")
                .attr("d", this.path(this.getTropicOfCapricornForPath()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");
        }

        if (this.Options.projectNorthernArcticCircle) {
            group.append("path")
                .attr("id", "북극권")
                .attr("d", this.path(this.getNorthernArcticCircle()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");
        }

        if (this.Options.projectSouthernArcticCircle) {
            group.append("path")
                .attr("id", "남극권")
                .attr("d", this.path(this.getSouthernArcticCircle()))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");
        }

        if (this.type !== WorldMapGenerator.GENERATOR_TYPES.SPHERE)
            motherGroup.append("path")
                .attr("id", "outline")
                .attr("d", this.path(this.outline))
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");
        else
            motherGroup.append("circle")
                .attr("id", "outline")
                .attr("cx", this.width / 2)
                .attr("cy", this.height / 2)
                .attr("r", (this.width - 20) / 2)
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", "0.4pt");

        let circleGroup, lineGroup, lineForClickGroup;
        if (this.circles.length > 0)
            circleGroup = group.append("g").attr("id", "circles");

        this.circles.forEach((circle, index) => {
            const drawnCircle = d3.geoCircle().center(circle.center).radius(circle.radius).precision(this.precision)();
            circleGroup.append("path")
                .attr("id", `circle-${index}`)
                .attr("onclick", "generator.deleteShape(this)")
                .attr("d", this.path(drawnCircle))
                .attr("fill", this.CustomStyles.circleStrokeColor)
                .attr("fill-opacity", "0.1")
                .attr("stroke", this.CustomStyles.circleStrokeColor)
                .attr("stroke-width", this.CustomStyles.circleStrokeWidth);
        });

        if (this.lines.length > 0) {
            lineGroup = group.append("g").attr("id", "lines");
            lineForClickGroup = group.append("g").attr("id", "lineforclick");
        }

        this.lines.forEach((line, index) => {
            lineGroup.append("path")
                .attr("id", `line-${index}`)
                .attr("d", this.path({
                    type: "LineString",
                    coordinates: [line.from, line.to]
                }))
                .attr("fill", "none")
                .attr("stroke", this.CustomStyles.lineStrokeColor)
                .attr("stroke-width", this.CustomStyles.lineStrokeWidth);

            lineForClickGroup.append("path")
                .attr("id", `lineforclick-${index}`)
                .attr("onclick", `generator.deleteShape(document.getElementById('line-${index}'))`)
                .attr("d", this.path({
                    type: "LineString",
                    coordinates: [line.from, line.to]
                }))
                .attr("fill", "none")
                .attr("stroke", "transparent")
                .attr("stroke-width", "6pt");
        });
    }

    /**
     * 현재 지도를 SVG 파일로 다운로드합니다.
     * 다운로드 전 불필요한 속성(onclick, transform 등)을 제거합니다.
     */
    downloadSVG() {
        if (!this._already_alerted) {
            alert("모든 도형들의 선의 색, 내부의 색은 RGB이기 때문에 일러스트레이터에서 '반드시' '전부' CMYK로 변경하세요!");
            this._already_alerted = true;
        }

        const lineForClickGroup = document.getElementById("lineforclick");
        if (lineForClickGroup !== null)
            lineForClickGroup.remove();
    
        // 휠을 통해 확대/축소된 것은 제외하게 Clone 생성
        const svgClone = document.querySelector(`#${this.svgId}`).cloneNode(true);
        svgClone.removeAttribute("style");
        // SVG Clone의 transform attribute를 전부 제거 (줌 상태 초기화)
        const elementsWithTransform = svgClone.querySelectorAll('[transform]');
        elementsWithTransform.forEach(el => el.removeAttribute('transform'));

        // 상호작용 속성 제거
        const elementsWithOnClick = svgClone.querySelectorAll('[onclick]');
        elementsWithOnClick.forEach(el => el.removeAttribute('onclick'));

        // title 태그 요소들 제거
        const titleElements = svgClone.querySelectorAll('title');
        titleElements.forEach(el => el.remove());

        // SVG 데이터 직렬화 및 Blob 생성
        const data = new XMLSerializer().serializeToString(svgClone);
        const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });

        // 다운로드 링크 생성 및 클릭
        const link = document.createElement("a");
        link.download = this.fileName;
        link.href = URL.createObjectURL(blob);
        link.click();

        // 화면 복구
        this.drawSVG(false);
    }

    /**
     * 캔버스에 지도를 그립니다. drawSVG의 캔버스 분기와 동일한 내용을 메서드로 분리했습니다.
     */
    drawCanvas() {
        const forceSquash = true;
        // 기존 svg/캔버스 토글 처리
        const svg = document.getElementById(this.svgId);
        const canvas = document.getElementById(this.svgId.replace("svg", "canvas"));
        canvas.style.display = 'block';
        svg.style.display = 'none';

        // 크기 및 초기화
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.backgroundColor = '#ffffff';
        const ctx = canvas.getContext('2d', {alpha: false});
        // 캔버스를 흰색으로 명시적으로 채우기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);

        // 줌 상태를 캔버스로도 적용
        const transform = d3.zoomTransform(svg);
        ctx.save();
        ctx.setTransform(transform.k, 0, 0, transform.k, transform.x, transform.y);

        const proj = this.getProjection();
        const canvasPath = d3.geoPath().projection(proj).context(ctx);

        // 배경(바다)
        ctx.beginPath();
        canvasPath(this.outline);
        ctx.fillStyle = this.CustomStyles.oceanFillColor || '#fff';
        ctx.fill();

        // SVG에서 clipPath를 만들었던 것과 동일하게 캔버스에서도 outline에 따라 클리핑
        if (this.type !== WorldMapGenerator.GENERATOR_TYPES.SPHERE) {
            ctx.save();
            ctx.beginPath();
            canvasPath(this.outline);
            ctx.clip();
        }

        // 육지
        if (this.Options.projectLand) {
            if (!this.Options.projectBorder) {
                const landData = this.getLandForPath(forceSquash);
                landData.features.forEach(f => {
                    ctx.beginPath();
                    canvasPath(f);
                    ctx.fillStyle = this.CustomStyles.landFillColor;
                    ctx.fill();
                    if (this.CustomStyles.landStrokeColor) {
                        ctx.lineWidth = parseFloat(this.CustomStyles.landStrokeWidth);
                        ctx.strokeStyle = this.CustomStyles.landStrokeColor;
                        if (parseFloat(this.CustomStyles.landStrokeWidth) > 0)
                            ctx.stroke();
                    }
                });
            } else {
                const features = this.getCountriesForPath(forceSquash).features.slice().sort((a, b) => {
                    const nameA = a.properties.name;
                    const nameB = b.properties.name;
                    const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                    const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                    return selectedA - selectedB;
                });;
                
                features.forEach(s => {
                    ctx.beginPath(); canvasPath(s);
                    ctx.fillStyle = this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                    ctx.fill();
                    if (this.selectedAreas.has(s.properties.name)) {
                        ctx.lineWidth = parseFloat(this.CustomStyles.selectedCountryStrokeWidth);
                        ctx.strokeStyle = this.CustomStyles.selectedCountryStrokeColor;
                        if (parseFloat(this.CustomStyles.selectedCountryStrokeWidth) > 0)
                            ctx.stroke();
                    }
                });

                const countryBorders = this.getCountryBoundaryForPath(forceSquash).features;
                countryBorders.forEach(b => {
                    ctx.beginPath(); canvasPath(b);
                    const isDispute = this.isDisputeBorder(b.properties.countries || []);
                    ctx.lineWidth = parseFloat(isDispute ? this.CustomStyles.disputeBorderStrokeWidth : this.CustomStyles.borderStrokeWidth);
                    ctx.strokeStyle = isDispute ? this.CustomStyles.disputeBorderStrokeColor : this.CustomStyles.borderStrokeColor;
                    const dash = (isDispute ? this.CustomStyles.disputeBorderStrokeDash : this.CustomStyles.borderStrokeDash).split(/\s+/).map(Number).filter(n => !isNaN(n));
                    ctx.setLineDash(dash);
                    if (parseFloat(isDispute ? this.CustomStyles.disputeBorderStrokeWidth : this.CustomStyles.borderStrokeWidth) > 0)
                        ctx.stroke();
                    ctx.setLineDash([]);
                });

                if (this.Options.projectUSAStateBorder) {
                    const states = this.getUSAStatesForPath(forceSquash).features.slice().sort((a, b) => {
                        const nameA = a.properties.name;
                        const nameB = b.properties.name;
                        const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                        const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                        return selectedA - selectedB;
                    });
                    states.forEach(s => {
                        ctx.beginPath(); canvasPath(s);
                        ctx.fillStyle = this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                        ctx.fill();
                        if (this.selectedAreas.has(s.properties.name)) {
                            ctx.lineWidth = parseFloat(this.CustomStyles.selectedCountryStrokeWidth);
                            ctx.strokeStyle = this.CustomStyles.selectedCountryStrokeColor;
                            if (parseFloat(this.CustomStyles.selectedCountryStrokeWidth) > 0)
                                ctx.stroke();
                        }
                    });
                    const statesBorder = this.getUSAStatesBorderForPath(forceSquash).features;
                    statesBorder.forEach(b => {
                        ctx.beginPath(); canvasPath(b);
                        ctx.fillStyle = 'none';
                        ctx.strokeStyle = this.CustomStyles.borderStrokeColor;
                        ctx.lineWidth = parseFloat(this.CustomStyles.borderStrokeWidth);
                        const dashArr = (this.CustomStyles.borderStrokeDash || '').split(/\s+/).map(Number).filter(n => !isNaN(n));
                        ctx.setLineDash(dashArr);
                        if (parseFloat(this.CustomStyles.borderStrokeWidth) > 0)
                            ctx.stroke();
                        ctx.setLineDash([]);
                    });
                }

                if (this.Options.projectChinaProvinceBorder && !this.Options.squashLand) {
                    const provinces = this.getChinaProvincesForPath().features.slice().sort((a, b) => {
                        const nameA = a.properties.name;
                        const nameB = b.properties.name;
                        const selectedA = this.selectedAreas.has(nameA) ? 1 : 0;
                        const selectedB = this.selectedAreas.has(nameB) ? 1 : 0;
                        return selectedA - selectedB;
                    });
                    provinces.forEach(s => {
                        ctx.beginPath(); canvasPath(s);
                        ctx.fillStyle = this.selectedAreas.has(s.properties.name) ? this.CustomStyles.selectedCountryFillColor : this.CustomStyles.landFillColor;
                        ctx.fill();
                        if (this.selectedAreas.has(s.properties.name)) {
                            ctx.lineWidth = parseFloat(this.CustomStyles.selectedCountryStrokeWidth);
                            ctx.strokeStyle = this.CustomStyles.selectedCountryStrokeColor;
                            if (parseFloat(this.CustomStyles.selectedCountryStrokeWidth) > 0)
                                ctx.stroke();
                        }
                    });
                    const provincesBorder = this.getChinaProvincesBorderForPath().features;
                    provincesBorder.forEach(b => {
                        ctx.beginPath(); canvasPath(b);
                        ctx.fillStyle = 'none';
                        ctx.strokeStyle = this.CustomStyles.borderStrokeColor;
                        ctx.lineWidth = parseFloat(this.CustomStyles.borderStrokeWidth);
                        const dashArr = (this.CustomStyles.borderStrokeDash || '').split(/\s+/).map(Number).filter(n => !isNaN(n));
                        ctx.setLineDash(dashArr);
                        if (parseFloat(this.CustomStyles.borderStrokeWidth) > 0)
                            ctx.stroke();
                        ctx.setLineDash([]);
                    });
                }

                const landData = this.getLandForPath(forceSquash);
                landData.features.forEach(f => {
                    ctx.beginPath();
                    canvasPath(f);
                    if (this.CustomStyles.landStrokeColor) {
                        ctx.lineWidth = parseFloat(this.CustomStyles.landStrokeWidth);
                        ctx.strokeStyle = this.CustomStyles.landStrokeColor;
                        if (parseFloat(this.CustomStyles.landStrokeWidth) > 0)
                            ctx.stroke();
                    }
                });
            }
        }

        // 호수
        if (this.Options.projectLakeReservoir) {
            const lakes = this.getLakeReservoirForPath(forceSquash);
            lakes.features.forEach(f => {
                ctx.beginPath(); canvasPath(f);
                ctx.fillStyle = this.CustomStyles.lakeFillColor;
                ctx.fill();
                if (this.CustomStyles.lakeStrokeColor) {
                    ctx.lineWidth = parseFloat(this.CustomStyles.lakeStrokeWidth);
                    ctx.strokeStyle = this.CustomStyles.lakeStrokeColor;
                    if (parseFloat(this.CustomStyles.lakeStrokeWidth) > 0)
                        ctx.stroke();
                }
            });
        }

        if (this.Options.projectPlateBoundary) {
            ctx.beginPath(); canvasPath(this.getPlateBoundaryForPath());
            ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke();
        }

        if (this.Options.projectInclination) {
            const incl = this.getInclinationForPath();
            incl.features.forEach(f => { ctx.beginPath(); canvasPath(f); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); });
        }

        if (this.Options.projectOceanCurrents) {
            const warm = this.getOceanCurrentsForPath('warm');
            warm.features.forEach(f => { ctx.beginPath(); canvasPath(f); ctx.strokeStyle = '#f00'; ctx.lineWidth = 0.7; ctx.stroke(); });
            const cold = this.getOceanCurrentsForPath('cold');
            cold.features.forEach(f => { ctx.beginPath(); canvasPath(f); ctx.strokeStyle = '#00f'; ctx.lineWidth = 0.7; ctx.stroke(); });
        }

        if (this.Options.projectDeepCirculations) {
            ['bottom','deep','surface'].forEach(level => {
                const mapLevel = { bottom: 'projectBottomWater', deep: 'projectDeepWater', surface: 'projectSurfaceWater' }[level];
                if (!this.Options[mapLevel]) return;
                const feats = this.getDeepCirculationsForPath(level);
                feats.features.forEach(f => { ctx.beginPath(); canvasPath(f); ctx.strokeStyle = level === 'bottom' ? '#bbb' : (level === 'deep' ? '#666' : '#000'); ctx.lineWidth = 0.7; ctx.stroke(); });
            });
        }

        if (this.Options.projectCulturalBoundary) {
            const feats = this.getCulturalBoundaryForPath().features;
            feats.forEach(f => {
                ctx.beginPath();
                canvasPath(f);
                ctx.lineWidth = parseFloat(this.CustomStyles.culturalBoundaryStrokeWidth);
                ctx.strokeStyle = this.CustomStyles.culturalBoundaryStrokeColor;
                if (parseFloat(this.CustomStyles.culturalBoundaryStrokeWidth) > 0)
                    ctx.stroke();
            });
        }

        // 경위도선
        if (this.Options.projectLatitude) { ctx.beginPath(); canvasPath(this.getLatitudeForPath()); ctx.lineWidth = 0.3; ctx.setLineDash([1.5,1]); ctx.strokeStyle = '#000'; ctx.stroke(); ctx.setLineDash([]); }
        if (this.Options.projectLongitude) { ctx.beginPath(); canvasPath(this.getLongitudeForPath()); ctx.lineWidth = 0.3; ctx.setLineDash([1.5,1]); ctx.strokeStyle = '#000'; ctx.stroke(); ctx.setLineDash([]); }

        // 적도, 회귀선 등
        if (this.Options.projectEquator && ((this.type === WorldMapGenerator.GENERATOR_TYPES.SPHERE && Math.abs(this.rotate[1]) !== 90) || this.type === WorldMapGenerator.GENERATOR_TYPES.VARIOUS)) { ctx.beginPath(); canvasPath(this.getEquatorForPath()); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); }
        if (this.Options.projectTropicOfCancer) { ctx.beginPath(); canvasPath(this.getTropicOfCancerForPath()); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); }
        if (this.Options.projectTropicOfCapricorn) { ctx.beginPath(); canvasPath(this.getTropicOfCapricornForPath()); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); }
        if (this.Options.projectNorthernArcticCircle) { ctx.beginPath(); canvasPath(this.getNorthernArcticCircle()); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); }
        if (this.Options.projectSouthernArcticCircle) { ctx.beginPath(); canvasPath(this.getSouthernArcticCircle()); ctx.lineWidth = 0.4; ctx.strokeStyle = '#000'; ctx.stroke(); }

        // 클리핑 영역에서 벗어나지 않도록 캔버스 상태 복원
        if (this.type !== WorldMapGenerator.GENERATOR_TYPES.SPHERE) {
            ctx.restore();
        }

        // 외곽선 (outline)
        if (this.type !== WorldMapGenerator.GENERATOR_TYPES.SPHERE) {
            ctx.beginPath();
            canvasPath(this.outline);
            ctx.fillStyle = 'none';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.4;
            ctx.stroke();
        } else {
            // circle outline centered in canvas
            ctx.beginPath();
            const cx = this.width / 2;
            const cy = this.height / 2;
            const r = (this.width - 20) / 2;
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.fillStyle = 'none';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.4;
            ctx.stroke();
        }

        // 도형(원, 선)
        this.circles.forEach((circle) => {
            const drawn = d3.geoCircle().center(circle.center).radius(circle.radius).precision(this.precision)();
            ctx.beginPath(); canvasPath(drawn); ctx.fillStyle = this.CustomStyles.circleStrokeColor; ctx.globalAlpha = 0.1; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = this.CustomStyles.circleStrokeColor; ctx.lineWidth = parseFloat(this.CustomStyles.circleStrokeWidth) || 0.4; ctx.stroke();
        });

        this.lines.forEach((line) => {
            ctx.beginPath(); canvasPath({ type: 'LineString', coordinates: [line.from, line.to] }); ctx.strokeStyle = this.CustomStyles.lineStrokeColor; ctx.lineWidth = parseFloat(this.CustomStyles.lineStrokeWidth) || 0.4; ctx.stroke();
        });

        // zoom 변환 복원 (초기 save()와 짝을 이룸)
        ctx.restore();
    }
}