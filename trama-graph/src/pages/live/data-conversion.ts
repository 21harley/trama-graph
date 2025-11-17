import { useLiveStore } from "./store";

const MQ_RL_VALUE = 1.0;
const RO = useLiveStore.getState().RO;

//Curvas logarítmicas (log-log)
const LPGCurve: number[] = [2.3010, -0.1549, -2.6504];
const CH4Curve: number[] = [2.3010, -0.0223, -2.5107];

//Coeficientes polinomiales grado 4 (log-log)
const CO_poly: number[] = [-815.95, 1496.7, -1003.8, 283.9, -24.3];
const Alcohol_poly: number[] = [299.0212, -464.9841, 257.6151, -64.5450, 9.8576]
const H2_poly: number[] = [48.5301, -40.8596, 7.8786, -2.9778, 3.0131]
const alpha = 0.05;
let f_rs_ro = 6.5;
let RO_ESTIMADO;

export function convertData(mv: number) {
    RO_ESTIMADO = RO;

    if (mv > 0) {
        const volt = mv / 1000.0;
        const rs = MQ_RL_VALUE * (5.0 - volt) / volt;
        let rs_ro = rs / RO_ESTIMADO;
        f_rs_ro = alpha * rs_ro + (1 - alpha) * f_rs_ro;
        rs_ro = f_rs_ro;

        let ppm_CO, ppm_Alcohol, ppm_H2, ppm_CH4, ppm_LPG = 0;

        //CO
        if (rs_ro > 2.3 && rs_ro < 3.9) {
            ppm_CO = MQGetPoly(rs_ro, CO_poly);
        } else if (rs_ro <= 2.3) {
            ppm_CO = 10000;
        } else {
            ppm_CO = 0;
        }

        // Alcohol
        if (rs_ro > 1.6 && rs_ro < 3.5) {
            ppm_Alcohol = MQGetPoly(rs_ro, Alcohol_poly);
        } else if (rs_ro <= 1.6) {
            ppm_Alcohol = 10000;
        } else {
            ppm_Alcohol = 0;
        }

        // H2
        if (rs_ro > 0.67 && rs_ro < 1.8) {
            ppm_H2 = MQGetPoly(rs_ro, H2_poly);
        } else if (rs_ro <= 0.67) {
            ppm_H2 = 10000;
        } else {
            ppm_H2 = 0;
        }

        //CH4
        if (rs_ro > 0.2 && rs_ro < 6.5) {
            ppm_CH4 = MQGetPercentage(rs_ro, CH4Curve);
        } else if (rs_ro <= 0.2) {
            ppm_CH4 = 10000;
        } else {
            ppm_CH4 = 0;
        }

        //LPG
        if (rs_ro > 0.16 && rs_ro < 6.5) {
            ppm_LPG = MQGetPercentage(rs_ro, LPGCurve);
        } else if (rs_ro <= 0.16) {
            ppm_LPG = 10000;
        } else {
            ppm_LPG = 0;
        }

        if (f_rs_ro > 6.5) {
            RO_ESTIMADO += 0.01;
        }

        return { CO: ppm_CO, AL: ppm_Alcohol, H2: ppm_H2, CH4: ppm_CH4, LPG: ppm_LPG }
    }
}


function MQGetPercentage(rs_ro_ratio: number, pcurve: number[]) {
    const x = Math.log10(rs_ro_ratio);
    const log_ppm = ((x - pcurve[1]) * pcurve[2]) + pcurve[0];
    return Math.pow(10, log_ppm);
}

function MQGetPoly(rs_ro_ratio: number, coef: number[]) {
    const x = Math.log10(rs_ro_ratio);
    const log_ppm = coef[4]
        + coef[3] * x
        + coef[2] * x * x
        + coef[1] * x * x * x
        + coef[0] * x * x * x * x;
    return Math.pow(10, log_ppm);
}