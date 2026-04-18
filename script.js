const speedOfLight = 299_792_458;

const freqSlider = document.getElementById('freqMhz');
const freqValue = document.getElementById('freqValue');
const wavelengthValue = document.getElementById('wavelengthValue');

const voltageInput = document.getElementById('voltage');
const currentInput = document.getElementById('current');
const powerValue = document.getElementById('powerValue');

function updateWavelength() {
  const freqMHz = Number(freqSlider.value);
  const freqHz = freqMHz * 1_000_000;
  const wavelengthMeters = speedOfLight / freqHz;
  freqValue.textContent = freqMHz.toFixed(0);
  wavelengthValue.textContent = wavelengthMeters.toFixed(3);
}

function updatePower() {
  const voltage = Number(voltageInput.value) || 0;
  const current = Number(currentInput.value) || 0;
  powerValue.textContent = (voltage * current).toFixed(2);
}

freqSlider.addEventListener('input', updateWavelength);
voltageInput.addEventListener('input', updatePower);
currentInput.addEventListener('input', updatePower);

updateWavelength();
updatePower();
