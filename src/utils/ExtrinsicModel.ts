export class ExtrinsicModel {
    public static loadExtrinsic = (data: IExtrinsicData) => {
        return new ExtrinsicModel(data);
    }

    constructor(public data?: IExtrinsicData) {
        if (!data) {
            data = {
                badges: [],
                levels: [],
                scores: {
                    kills: 0,
                    deaths: 0,
                    playtime: 0,
                },
            };
        }
    }
}

export interface IExtrinsicData {
    badges: boolean[];
    levels: number[];
    scores: {
        kills: number,
        deaths: number,
        playtime: number,
    };
}
