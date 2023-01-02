
let value = 10;
let startAmount = 0;
let monthlyAmount = 1000;
language = "EN" // CONFIG: Change this to DA for the danish page

const currencies = {
usd : {
    startAmount : {defaultValue: 5000, minValue: 0, maxValue: 10000},
    monthlyAmount: {defaultValue: 1000, minValue: 100, maxValue: 5500},
},
eur : {
    startAmount : {defaultValue: 3000, minValue: 0, maxValue: 6000},
    monthlyAmount: {defaultValue: 1000, minValue: 200, maxValue: 5000},
},
gbp : {
    startAmount : {defaultValue: 3000, minValue: 0, maxValue: 6000},
    monthlyAmount: {defaultValue: 1000, minValue: 200, maxValue: 5000},
},
dkk : {
    startAmount : {defaultValue: 30000, minValue: 0, maxValue: 75000},
    monthlyAmount: {defaultValue: 8000, minValue: 1000, maxValue: 35000},
}
};


// set up danish
if(language == "DA"){
const investmentHorizonTextElement = document.getElementById("investment-horizon-text");
investmentHorizonTextElement.innerHTML = "Investeringshorisont";
const startingAmountTextElement = document.getElementById("starting-amount-text");
startingAmountTextElement.innerHTML = "Nuværende opsparing";
const monthlyInvestmentTextElement = document.getElementById("monthly-investment-text");
monthlyInvestmentTextElement.innerHTML = "Månedlig investering";
const savingTextElement = document.getElementById("saving-text");
savingTextElement.innerHTML = "Opsparet";
const investingTextElement = document.getElementById("investing-text");
investingTextElement.innerHTML = "Investeret";
const chooseCurrencyTextElement = document.getElementById("choose-currency-text");
chooseCurrencyTextElement.innerHTML = "Vælg din valuta";
}


let currentCurrency = 'EUR'; // CONFIG: Change this to "GBP" for GB page and "DKK" for danish page
let selectedCurrencyElement = document.getElementById(`${currentCurrency}-currency`);
selectedCurrencyElement.classList.add("selected");

document.querySelector(".currencies").addEventListener("click", (event) => {
if(!event.target.classList.contains("currency")) return;
event.stopPropagation();
selectedCurrencyElement.classList.remove("selected")
event.target.classList.add("selected")
selectedCurrencyElement = event.target;
})

const formatAmount = (number) => {
let v = number.toString();
const chunks = [];
for(let i = v.length; i > 0; i -= 3) {
    const s = v.substring(i-3, i)
    if(chunks.length) chunks.unshift(" ");
    chunks.unshift(s);
}
return "".concat.apply("", chunks)
}

const setCurrency = (currency) => {
currentCurrency = currency;

const {startAmount, monthlyAmount} = currencies[currency.toLowerCase()];
const startAmountSlider = document.getElementById("startAmount");
startAmountSlider.min = startAmount.minValue;
startAmountSlider.max = startAmount.maxValue;
startAmountSlider.value = startAmount.defaultValue;

const monthlyAmountSlider = document.getElementById("monthlyAmount");
monthlyAmountSlider.min = monthlyAmount.minValue;
monthlyAmountSlider.max = monthlyAmount.maxValue;
monthlyAmountSlider.value = monthlyAmount.defaultValue;

updateHorizonSlider();
updateStartAmountSlider();
updateMonthlyAmountSlider();
}

let chart;

const ctx = document.getElementById('fi-chart').getContext('2d');
// styling of chart
Chart.defaults.color = '#FBF7ED';
Chart.defaults.borderColor = 'white';
Chart.defaults.font.family = "'Inter'";
Chart.defaults.font.size = 14;

function createRadialGradient3(context, c1, c3) {
const cache = new Map();
let width = null;
let height = null;
const chartArea = context.chart.chartArea;
if (!chartArea) {
    // This case happens on initial chart load
    return;
}
const chartWidth = chartArea.right - chartArea.left;
const chartHeight = chartArea.bottom - chartArea.top;
if (width !== chartWidth || height !== chartHeight) {
    cache.clear();
}
let gradient = cache.get(c1 + c3);
if (!gradient) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    const centerX = (chartArea.left + chartArea.right) /1.9; // 1,9
    const centerY = (chartArea.top + chartArea.bottom) / 10; //3,5
    const r = Math.min(
    (chartArea.right - chartArea.left) / 0.9,
    (chartArea.bottom - chartArea.top) / 0.9,
    );
    const ctx = context.chart.ctx;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c3);
    cache.set(c1 + c3, gradient);
}
return gradient;
}

const calculateReturn = (rate, years, initialDeposit, monthlyDeposit, yearStep) => {
let accumulator = parseInt(initialDeposit);
const yValues = [accumulator];
for (var year = 1; year <= years; year++) {
    accumulator = (accumulator + 12 * monthlyDeposit) * rate;
    if (year % yearStep == 0) {
    yValues.push(accumulator);
    }
}
return yValues;
};

const makeChart = () => {
// Create data
let labels = [];
let investmentValues = []
let savingValues = []

for(let i= 0; i <= value; i+=5 ){
    labels.push(i)
    savingValues.push(startAmount + (monthlyAmount * i * 12));
}
investmentValues = calculateReturn(1.08, value, startAmount, monthlyAmount, 5)

const data = {
    labels: labels,
    datasets: [
    {
        label: `saving`,
        data: savingValues,
        fill: false,
        borderColor: 'white',
        borderWidth: 2,
        borderDash: [10]
    },
    {
        label: `investing`,
        data: investmentValues,
        fill: true,
        showLine: false,
        // backgroundColor: (ctx) => createRadialGradient3(ctx, 'rgba(13, 122, 129, 0.4)', "#EEFF86"), use this for new brand colors
        backgroundColor: (ctx) => createRadialGradient3(ctx, 'rgba(254, 181, 134, 0.4)', "#B0BDC2"),
    },
    ]
};

// Create legends
const investLegendValueElement = document.getElementById('invest-legend-value');
const investLegendValue = Math.floor(investmentValues[investmentValues.length -1]).toString();
const formattedInvestLegendValue = formatAmount(investLegendValue);
investLegendValueElement.innerHTML = `${currentCurrency} ${formattedInvestLegendValue}`;

const saveLegendValueElement = document.getElementById('save-legend-value');
const saveLegendValue = Math.floor(savingValues[savingValues.length -1]).toString();
const formattedSaveLegendValue = formatAmount(saveLegendValue);
saveLegendValueElement.innerHTML = `${currentCurrency} ${formattedSaveLegendValue}`;
const locale = language === "DA" ? "da-DK": "en-US"

// Create chart
chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
    locale: locale,
    plugins: {
        legend: {
        display: false,
        }
    },
    animation: false,
    pointRadius: 0, // disables points
    scales: {
        x: {
        grid: {
            display: false
        }, 
        display: false
        },
        y: {
        min: 0,
        }
    },
    }
});
}

makeChart();

// Set up sliders
const setUpSlider = (id, f, unitType) => {
const slider = document.getElementById(id);
const rangeText = slider.parentElement.querySelector('.range-text');
const minSize = 58, maxSize = 99;

slider.oninput = function() {  
    const minValue = parseInt(slider.min);
    const maxValue = parseInt(slider.max);

    f(parseInt(this.value));

    let newVal = (this.value -minValue) / (maxValue-minValue) * 100;

    const newSize = Math.round(minSize + (maxSize-minSize) * newVal/100);
    slider.style.setProperty(`--${id}-size`, newSize + "px");

    const sliderWidth = slider.clientWidth;
    const effectiveWidth = (sliderWidth) - newSize;
    const currentCenter = newSize / 2 + effectiveWidth * newVal / 100;
    const expectedCenter = sliderWidth * newVal / 100;
    slider.style.setProperty(`--${id}-offset`, `${expectedCenter - currentCenter}px`);

    if(unitType == "currency"){
    rangeText.innerHTML = `${this.value} ${currentCurrency}`; //Set range text equal to input position
    } else {
    if(language == "DA"){
        rangeText.innerHTML = `${this.value} År`; //Set range text equal to input position

    } else {
        rangeText.innerHTML = `${this.value} Years`; //Set range text equal to input position
    }
    }
    rangeText.style["font-size"] = '12px';
    rangeText.style.width = "initial"
    rangeText.style.transform = `translate(${-rangeText.clientWidth/2 + expectedCenter}px, 55px)`;
    rangeText.style.width = "0px"
    rangeText.style.color= "#0D7A81";

    chart.destroy()
    makeChart();
};
slider.oninput()
return slider.oninput.bind(slider);
};

updateHorizonSlider = setUpSlider("horizon", (v) => value = v, "");
updateStartAmountSlider = setUpSlider("startAmount", (v) => startAmount = v, "currency");
updateMonthlyAmountSlider = setUpSlider("monthlyAmount", (v) => monthlyAmount = v, "currency");

setCurrency(currentCurrency);
