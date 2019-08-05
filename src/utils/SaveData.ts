export class SaveData{
    private static extrinsic:ExtrinsicModel;
    private static VERSION = 6;

    public static init(){
        this.loadVersion(version=>{
            if (version < SaveData.VERSION){
                SaveData.confirmReset();
                SaveData.saveVersion(SaveData.VERSION);
                SaveData.saveExtrinsic();
            }else{
                SaveData.loadExtrinsic(extrinsic=>{
                    if (extrinsic){
                        SaveData.extrinsic=extrinsic;
                    }else{
                        SaveData.confirmReset();
                    }
                });
            }
        });
    }
    public static resetData():Function{
        return this.confirmReset;
    }

    private static confirmReset=()=>{
        SaveData.extrinsic=new ExtrinsicModel();
    }

    public static getExtrinsic():ExtrinsicModel{
        return SaveData.extrinsic;
    }

    public static saveExtrinsic(callback?:(extrinsic?:ExtrinsicModel)=>void,extrinsic?:ExtrinsicModel){
        extrinsic=extrinsic||this.extrinsic;
        SaveData.saveExtrinsicToLocal(extrinsic);
        if (callback){
            callback(extrinsic);
        }
    }

    public static loadExtrinsic(callback?:(extrinsic?:ExtrinsicModel)=>void){
        let extrinsic=this.loadExtrinsicFromLocal();
        if (callback){
            callback(extrinsic);
            
        }
    }

    public static saveExtrinsicToLocal(extrinsic?:ExtrinsicModel){
        extrinsic=extrinsic||this.extrinsic;
        if (typeof(Storage)!=="undefined"){
            window.localStorage.setItem("Extrinsic",JSON.stringify(extrinsic.data));
        }else{
            console.log("NO STORAGE!");
        }
    }

    public static loadExtrinsicFromLocal():ExtrinsicModel{
        if (typeof(Storage)!=="undefined"){
            return ExtrinsicModel.loadExtrinsic(JSON.parse(window.localStorage.getItem("Extrinsic")));
        }else{
            console.log("NO STORAGE!");
        }
    }

    public static loadVersion(callback:(version:number)=>void){
        if (typeof(Storage)!=="undefined"){
            callback(Number(window.localStorage.getItem("Version")));
        }else{
            console.log("NO STORAGE!");
            callback(0);
        }
    }

    public static saveVersion(version:number){
        if (typeof(Storage)!=="undefined"){
            window.localStorage.setItem("Version",String(version));
        }else{
            console.log("NO STORAGE!");
        }
    }
}

export class ExtrinsicModel{
    static loadExtrinsic=(data:ExtrinsicData)=>{
      return new ExtrinsicModel(data);
    }
  
    constructor(public data?:ExtrinsicData){
      if (!data){
        data={
          badges:[],
          levels:[],
          scores:{
            kills:0,
            deaths:0,
            playtime:0
          }
        }
      }
    }
  }
  
  export interface ExtrinsicData{
    badges:boolean[];
    levels:number[];
    scores:{
      kills:number,
      deaths:number,
      playtime:number,
    };
  }