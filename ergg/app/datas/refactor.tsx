import axios from 'axios';
import Character from '../test/charData.json';
import CharMastery from '../test/charMastery.json';

export interface Data {
    code: number; // 험체 코드
    name: string; // 험체 이름 + 무기
    weapon: string;

    WR: number; // WinRate
    PR: number; // PickRate
    SR: number; // 점수+Rate

    data: PrimaryData | undefined;

    tier: number; //임시, 삭제예정
    nadjapoint: number; // 나쟈 포인트, 각종 지표로 산출된 정수로 티어 산출시 사용
};

export interface PrimaryData { // 원시타입, 소숫점 두자리 내림 되지 않은 데이터들
    entiregamecount: number;
    entiregamecountbytier: number;
    gamecountbygrade: Array<number>;  // 각 등수 count 0은 전체
    tkbygrade: Array<number>;
    avgdealbygrade: Array<number>;

    sbcount: number;
    sbscore: number;
    avggrade: number;
};

let parsedData: Array<any>;

export class Refacter {
    constructor(data?:Array<any>) { // new 선언 시 게임데이터 파싱 후 병합
        parsedData = data === undefined ? [Character] : this.mergeJSON(data!);
    }

    public mergeJSON(lists: Array<Array<any>>) { // 파싱 데이터 병합 함수
        let mergedList = lists[0];
        if (lists.length > 1) {
            lists.shift();

            lists.map((list, lp) => {
                mergedList.map((char, cp) => {
                    char.grades.map((weapon, wp) => {
                        weapon.map((tg, tp) => {
                            tg.map((grade, gp) => {
                                mergedList[cp].grades[wp][tp][gp] += list[cp].grades[wp][tp][gp];
                            });;
                        });
                    });
                    char.scores.map((weapon, wp) => {
                        weapon.map((tg, tp) => {
                            tg.map((scores, sp) => {
                                mergedList[cp].scores[wp][tp][sp] += list[cp].grades[wp][tp][sp];
                            });;
                        })
                    });
                });
                mergedList.map((char, cp) => {
                    char.tk.map((weapon, wp) => {
                        weapon.map((tg, tp) => {
                            tg.map((tks, p) => {
                                let a1befval = mergedList[cp].tk[wp][tp][p] * mergedList[cp].grades[wp][tp][p];
                                let a2befval = list[cp].tk[wp][tp][p] * list[cp].grades[wp][tp][p];
                                let a12grade = mergedList[cp].grades[wp][tp][p] + list[cp].grades[wp][tp][p]
                                mergedList[cp].tk[wp][tp][p] = isNaN((a1befval + a2befval) / a12grade) ? 0 : (a1befval + a2befval) / a12grade;
                                // 1 평킬 x 1 판수 + 2 평킬 x 2 판수 / 1판수 + 2판수
                            });
                        });
                    });
                    char.avgdeal.map((weapon, wp) => {
                        weapon.map((tg, tp) => {
                            tg.map((deals, p) => {
                                let a1befval = mergedList[cp].avgdeal[wp][tp][p] * mergedList[cp].grades[wp][tp][p];
                                let a2befval = list[cp].avgdeal[wp][tp][p] * list[cp].grades[wp][tp][p];
                                let a12grade = mergedList[cp].grades[wp][tp][p] + list[cp].grades[wp][tp][p]
                                mergedList[cp].avgdeal[wp][tp][p] = isNaN((a1befval + a2befval) / a12grade) ? 0 : (a1befval + a2befval) / a12grade;
                                // 1 평딜 x 1 판수 + 2 평딜 x 2 판수 / 1판수 + 2판수
                            });
                        });
                    });
                });
            });
        }
        return mergedList;
    }

    public getKoreanWeapon(weapon: string) { // 영문 무기이름 들어가면 한국 무기이름 반환..
        switch (weapon) {
            case "OneHandSword": return "단검";
            case "TwoHandSword": return "양손검";
            case "Axe": return "도끼";
            case "DualSword": return "쌍검";
            case "Pistol": return "권총";
            case "AssaultRifle": return "돌격소총";
            case "SniperRifle": return "저격총";
            case "Rapier": return "레이피어";
            case "Spear": return "창";
            case "Hammer": return "망치";
            case "Bat": return "방망이";
            case "HighAngleFire": return "투척";
            case "DirectFire": return "암기";
            case "Bow": return "활";
            case "CrossBow": return "석궁";
            case "Glove": return "글러브";
            case "Tonfa": return "톤파";
            case "Guitar": return "기타";
            case "Nunchaku": return "쌍절곤";
            case "Whip": return "채찍";
            case "Arcana": return "아르카나";
            case "Camera": return "카메라";
            case "VFArm": return "VF 의수";
            default: return weapon;
        }
    }

    public getCharTier(np: number) {
        if (np >= 260) {
            return 0;
        } else if (np >= 210) {
            return 1;
        } else if (np >= 180) {
            return 2;
        } else if (np >= 140) {
            return 3;
        } else if (np >= 100) {
            return 4
        } else {
            return 5;
        }
    }

    private getAvgGrade(code: number, weapon: number, starttiergroup: number, endtiergroup: number) {
        return (this.getGameCount(code, weapon, starttiergroup, endtiergroup, 1)
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 2) * 2
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 3) * 3
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 4) * 4
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 5) * 5
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 6) * 6
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 7) * 7
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 8) * 8
            + this.getGameCount(code, weapon, starttiergroup, endtiergroup, 9) * 4) / this.getGameCount(code, weapon, starttiergroup, endtiergroup, 0)
    }

    private getGameCount(code: number, weapon: number, starttiergroup: number, endtiergroup: number, grade: number) {
        // 5차원 배열 분해코드라 난잡함
        // code parameter : 각 험체 코드, 0 : 전체
        // weapon parameter : 각 무기코드(순서), 0 : 전체
        // tiergroup parameter : 각 티어그룹, 0 : 전체
        // grade parameter : 1 ~ 8 : 1 ~ 8 등, 9 : 탈출 , 0 : 전체(탈출 포함)
        let count = 0;

        if (code === 0) {
            if (weapon === 0) {
                parsedData.map((char, cp) => {
                    char.grades.map((weapon, wp) => {
                        if (starttiergroup > endtiergroup) {
                            for (let i = 0; i <= (starttiergroup - endtiergroup); i++) { // 포문은 조건비교보다 i++이 먼저
                                if (grade === 0) {
                                    weapon[starttiergroup - i - 1].forEach(element => {
                                        count += element;
                                    });
                                } else {
                                    count += weapon[starttiergroup - i - 1][grade - 1];
                                }
                            }
                        }
                        else if (starttiergroup === endtiergroup) {
                            if (grade === 0) {
                                weapon[starttiergroup - 1].forEach(element => {
                                    count += element;
                                });
                            } else {
                                count += weapon[starttiergroup - 1][grade - 1];
                            }
                        }
                    });
                });
            } else {
                parsedData.map((char, p) => {
                    if (starttiergroup > endtiergroup) {
                        for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                            if (grade === 0) {
                                char.grades[weapon - 1][starttiergroup - i - 1].forEach(element => {
                                    count += element;
                                });
                            } else {
                                count += char.grades[weapon - 1][starttiergroup - i - 1][grade - 1];
                            }
                        }
                    } else if (starttiergroup === endtiergroup) {
                        if (grade === 0) {
                            char.grades[weapon - 1][starttiergroup - 1].forEach(element => {
                                count += element;
                            });
                        } else {
                            count += char.grades[weapon - 1][starttiergroup - 1][grade - 1];
                        }
                    }
                });
            }
        } else {
            if (weapon === 0) {
                parsedData[code - 1].grades.map((weapon, wp) => {
                    if (starttiergroup > endtiergroup) {
                        for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                            if (grade === 0) {
                                weapon[starttiergroup - i - 1].forEach(element => {
                                    count += element;
                                });
                            } else {
                                count += weapon[starttiergroup - i - 1][grade - 1];
                            }
                        }
                    } else if (starttiergroup === endtiergroup) {
                        if (grade === 0) {
                            weapon[starttiergroup - 1].forEach(element => {
                                count += element;
                            });
                        } else {
                            count += weapon[starttiergroup - 1][grade - 1];
                        }
                    }
                });
            } else {
                if (starttiergroup > endtiergroup) {
                    for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                        if (grade === 0) {
                            parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1].forEach(e => {
                                count += e;
                            });
                        } else {
                            count += parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][grade - 1];
                        }
                    }
                } else if (starttiergroup === endtiergroup) {
                    if (grade === 0) {
                        parsedData[code - 1].grades[weapon - 1][starttiergroup - 1].forEach(e => {
                            count += e;
                        });
                    } else {
                        count += parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][grade - 1];
                    }
                }
            }
        }
        return count;
    }

    private getAvgdeal(code: number, weapon: number, starttiergroup: number, endtiergroup: number, grade: number) {
        // code, weapon 은 0일 수 없음
        let deal = 0;
        let targetgrades = 0;

        if (starttiergroup > endtiergroup) {
            for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                if (grade === 0) {
                    parsedData[code - 1].avgdeal[weapon - 1][starttiergroup - i - 1].map((avgdealByGrade, gp) => {
                        deal += avgdealByGrade * parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][gp];
                        targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][gp];
                    });
                } else {
                    deal += parsedData[code - 1].avgdeal[weapon - 1][starttiergroup - i - 1][grade - 1];
                    targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][grade - 1];
                }
            }
        } else if (starttiergroup === endtiergroup) {
            if (grade === 0) {
                parsedData[code - 1].avgdeal[weapon - 1][starttiergroup - 1].map((avgdealByGrade, gp) => {
                    deal += avgdealByGrade * parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][gp];
                    targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][gp];
                });
            } else {
                deal += parsedData[code - 1].avgdeal[weapon - 1][starttiergroup - 1][grade - 1];
                targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][grade - 1];
            }
        }
        return targetgrades !== 0 ? deal / targetgrades : 0;
    }

    private getAvgTK(code: number, weapon: number, starttiergroup: number, endtiergroup: number, grade: number) {
        // code, weapon 은 0일 수 없음
        let tk = 0;
        let targetgrades = 0;

        if (starttiergroup > endtiergroup) {
            for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                if (grade === 0) {
                    parsedData[code - 1].tk[weapon - 1][starttiergroup - i - 1].map((tkByGrade, gp) => {
                        tk += tkByGrade * parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][gp];
                        targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][gp];
                    });
                } else {
                    tk += parsedData[code - 1].tk[weapon - 1][starttiergroup - i - 1][grade - 1];
                    targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - i - 1][grade - 1];
                }
            }
        } else if (starttiergroup === endtiergroup) {
            if (grade === 0) {
                parsedData[code - 1].tk[weapon - 1][starttiergroup - 1].map((tkByGrade, gp) => {
                    tk += tkByGrade * parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][gp];
                    targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][gp];
                });
            } else {
                tk += parsedData[code - 1].tk[weapon - 1][starttiergroup - 1][grade - 1];
                targetgrades += parsedData[code - 1].grades[weapon - 1][starttiergroup - 1][grade - 1];
            }
        }
        return targetgrades !== 0 ? tk / targetgrades : 0;
    }

    private getSbCount(code: number, weapon: number, starttiergroup: number, endtiergroup: number) {
        // 순방 수 반환
        // code, weapon 은 0일 수 없음
        let count = 0;

        if (starttiergroup > endtiergroup) {
            for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                count += parsedData[code - 1].scores[weapon - 1][starttiergroup - i - 1][0];
            }
        } else if (starttiergroup === endtiergroup) {
            count += parsedData[code - 1].scores[weapon - 1][starttiergroup - 1][0];
        }
        return count;
    }

    private getSbScore(code: number, weapon: number, starttiergroup: number, endtiergroup: number) {
        // 순방 점수 반환
        // code, weapon 은 0일 수 없음
        let score = 0;

        if (starttiergroup > endtiergroup) {
            for (let i = 0; i <= (starttiergroup - endtiergroup); i++) {
                score += parsedData[code - 1].scores[weapon - 1][starttiergroup - i - 1][1];
            }
        } else if (starttiergroup === endtiergroup) {
            score += parsedData[code - 1].scores[weapon - 1][starttiergroup - 1][1];
        }
        return score;
    } // 나중에 이 데이터에서 뽑아내는 함수 싹 다른 파일로 넘기고 전역Data 하나 param으로 받아서 계산하게 해야됨




    private getNadjaPoint(char: Data) { // 티어 산출 밸런싱 필요
        let var1: number = char.data!.sbcount; // 
        let var2: number = char.data!.sbscore;
        let var3: number = char.data!.tkbygrade[0];
        let var4: number = char.WR;
        let var5: number = char.data!.avggrade;
        let var6: number = char.PR;
        return (var2 / var1 + var3 * 4 + var4 * 6 - (var5 - 3) * 30) * var6;
    }

    public getListforTiergroup(startTierGroup: number, endTierGroup: number) { // 우선순위 1 함수 가독성 및 효율 개선 필요, 
        // 티어그룹 플레+ 다이아+ 릴+ 추가 필요. function(startTierGroup, endTierGroup) 이런식으로 function(1, 0) 하면 이터 + function(2, 0) 하면 릴+ function (4, 3) 하면 플레만
        // 표본 수 확인가능하게 표시하기
        let newCharList: Array<Data> = [];

        parsedData.map((char, p) => {
            let weaponData = Object.values(CharMastery[p]);
            weaponData.shift(); // 첫 항목 (캐릭코드)날리고

            weaponData.map((weapon, wcode) => {
                if (weapon !== "None") {
                    let properties: PrimaryData = {
                        entiregamecount: this.getGameCount(0, 0, 8, 1, 0), // 전체 표본 수
                        entiregamecountbytier: this.getGameCount(0, 0, startTierGroup, endTierGroup, 0), // 해당 티어그룹 내 전체 표본 수
                        gamecountbygrade: [
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 0),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 1),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 2),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 3),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 4),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 5),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 6),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 7),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 8),
                            this.getGameCount(char.code, wcode + 1, startTierGroup, endTierGroup, 9)],
                        sbcount: this.getSbCount(char.code, wcode + 1, startTierGroup, endTierGroup),
                        sbscore: this.getSbScore(char.code, wcode + 1, startTierGroup, endTierGroup),
                        avgdealbygrade: [
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 0),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 1),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 2),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 3),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 4),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 5),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 6),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 7),
                            this.getAvgdeal(char.code, wcode + 1, startTierGroup, endTierGroup, 8),],
                        avggrade: this.getAvgGrade(char.code, wcode + 1, startTierGroup, endTierGroup),
                        tkbygrade: [
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 0),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 1),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 2),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 3),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 4),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 5),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 6),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 7),
                            this.getAvgTK(char.code, wcode + 1, startTierGroup, endTierGroup, 8),],
                    }

                    let newData: Data = {
                        code: char.code,
                        name: char.name,
                        weapon: this.getKoreanWeapon(weapon.toString()),

                        WR: properties.gamecountbygrade[0] === 0 ? 0 :
                            Math.floor(properties.gamecountbygrade[1] / properties.gamecountbygrade[0] * 10000) / 100,
                        PR: properties.entiregamecount === 0 ? 0 :
                            Math.floor(properties.gamecountbygrade[0] / properties.entiregamecountbytier * 10000) / 100,
                        SR: properties.gamecountbygrade[0] === 0 ? 0 :
                            Math.floor(properties.sbcount / properties.gamecountbygrade[0] * 10000) / 100,

                        nadjapoint: 0,
                        tier: 0,

                        data: properties
                    };
                    newData.nadjapoint = this.getNadjaPoint(newData);
                    newData.tier = this.getCharTier(newData.nadjapoint);
                    newCharList.push(newData);
                }
            });
        });

        return newCharList;
    }
}

