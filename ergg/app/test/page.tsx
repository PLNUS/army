'use client'

import axios from "axios";
import { useEffect, useState } from "react";
import CharacterData from "./charData.json";
import CharMastery from "./charMastery.json";
import CharData2 from "./charData2.json";
import WeaponData from "../datas/weaponData.json";
import { getTier, getTierCut, getTierGroup, writeData } from "./ertool";

export const API_KEY = 'i1C9XPLAWw44iInr1a8oA4KIZBDwpN8IaLzs9ba0';

var rankcount = 0;

interface Char { // 기록하는 지표 형식
  name: string, // 험체 이름
  code: number, // 험체 코드
  grades: Array<Array<Array<number>>> // 무기별 -> 그룹별 -> [등수-1] 수 9등은 탈출
  scores: Array<Array<Array<number>>> // 무기별 -> 그룹별 -> / [0] -> 점수 먹은 판수 [1] -> 점수 변동폭(단위p)
  avgdeal: Array<Array<number>> // 무기별 -> 그룹별 평딜 
  tk: Array<Array<number>> // 무기별 -> 그룹별 평균팀킬 
}

function append(args: string) {
  document.getElementById('status')!.innerText += args + '\n';
  document.getElementById('status')!.scrollTop = document.getElementById('status')!.scrollTop + document.getElementById('status')!.scrollHeight;
}

function appendJSON(args: string) {
  document.getElementById('json')!.innerText = args + '\n';
  document.getElementById('json')!.scrollTop = document.getElementById('status')!.scrollTop + document.getElementById('status')!.scrollHeight;
}

function appendCount(args: string) {
  document.getElementById('count')!.innerText = args + '\n';
  document.getElementById('count')!.scrollTop = document.getElementById('status')!.scrollTop + document.getElementById('status')!.scrollHeight;
}

function appendAnalysis(args: string) {
  document.getElementById('analysis')!.innerText = args + '\n';
  document.getElementById('analysis')!.scrollTop = document.getElementById('status')!.scrollTop + document.getElementById('status')!.scrollHeight;
}

var UpdatedData: Array<Char> = CharacterData;
var tierCut = [10000, 10000];

var start = 0, count = 0;

export default function Home() { // 내 유저코드 314853
  axios.get('https://open-api.bser.io/v1/rank/top/19/3', {
    params: {},
    headers: { 'x-api-key': 'i1C9XPLAWw44iInr1a8oA4KIZBDwpN8IaLzs9ba0' }
  }).then(function (response) {
    var eterCut = response.data.topRanks.find(e => e.rank === 200).mmr;
    var demiCut = response.data.topRanks.find(e => e.rank === 700).mmr;
    append('티어컷 계산완료');
    tierCut = [eterCut, demiCut];
  }).catch(function (e) {
    tierCut = [100000, 100000];
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "start") {
      start = parseInt(e.target.value);
    } else if (e.target.id === "count") {
      count = parseInt(e.target.value);
    }
  }

  useEffect(() => {
    // DOM 렌더링 이후 작동
  }, []);

  return (
    <div class="flex justify-center w-screen h-screen">
      <div class="flex flex-col bg-stone-100 p-8 w-[1400px] h-screen">
        <div class="flex flex-row w-full h-[400px] mb-4 gap-x-4">
          <div id="status" class="bg-stone-300 tracking-wide w-1/3 h-full overflow-x-hidden overflow-y-auto overscroll-auto p-2"></div>
          <div id="json" class="bg-stone-300 tracking-wide w-1/3 h-full overflow-x-hidden overflow-y-auto overscroll-auto p-2"></div>
          <div class="flex flex-col w-1/3 gap-y-4">
            <div id="count" class="bg-stone-300 tracking-wide grow overflow-x-hidden overflow-y-auto overscroll-auto p-2"></div>
            <div id="analysis" class="bg-stone-300 tracking-wide grow overflow-x-hidden overflow-y-auto overscroll-auto p-2"></div>
          </div>
        </div>
        <div class="flex flex-row w-full h-[50px] justify-between gap-x-4">
          <button
            class="rounded p-4 grow h-full bg-blue-400 text-center font-mr text-white"
            onClick={(e) => {
              UpdatedData = CharacterData;
              append("... 초기화 완료!");
            }
            }>데이터 초기화</button>
          <button
            class="rounded p-4 grow h-full bg-blue-400 text-center font-mr text-white"
            onClick={() => {
              writeData(UpdatedData);

            }
            } >내보내기</button>
          <input type="number" onChange={onChange} placeholder="시작할 게임 ID" id="start" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" required></input>
          <input type="number" onChange={onChange} placeholder="크롤링할 게임 수" id="count" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" required></input>

          <button
            class="rounded p-4 grow h-full bg-blue-400 text-center font-mr text-white"
            onClick={() => {
              append(start + '부터 ' + count + '회 크롤링');

              sendAsyncRequests(); // 동기식 For문 자체를 Function화시킴
            }
            }>게임 파싱</button>
          <button
            class="rounded p-4 grow h-full bg-blue-400 text-center font-mr text-white"
            onClick={() => {
              // appendAnalysis();
              var EntireTargets = 0;
              var EntireTargetsG1 = 0;
              var G1Picks56: number = 0;
              CharData2.map((char, p1) => {
                char.grades.map((weapon, p2) => {
                  weapon[0].forEach(g1 => {
                    EntireTargetsG1 += g1;
                  });
                  weapon.map((tier, p3) => {
                    tier.forEach(grades => {
                      EntireTargets += grades;
                    });
                  });
                });
              });
              CharData2[55].grades[0][1].forEach(element => {
                G1Picks56 += element;
              });
              var G1PR56 = G1Picks56 / EntireTargetsG1 * 100;
              appendAnalysis(`전체 판수는  ${EntireTargets} 피올로의 픽수는 ${G1Picks56} 그룹1 판수는 ${EntireTargetsG1} 픽률은 ${G1PR56} %`);
            }
            }>통계 계산</button>
        </div>
      </div>
    </div>
  )
}

function getGameData(gameCode: number) {
  return new Promise((resolve, rejects) => {
    axios.get('https://open-api.bser.io/v1/games/' + gameCode, { // 동기식 순차진행 안됨
      params: {},
      headers: { 'x-api-key': API_KEY }
    })
      .then(function (response) {
        UpdateFunc(response);
        resolve("성공")
      }).catch(function (error) {
        console.log(error);
        rejects("응않되")
      });
  })
}

function UpdateFunc(response: any) {
  var game: Array<any> = response.data.userGames;
  console.log(game);
  // matchingMode = 2 일반 3 랭크
  // matchingTeamMod = 3 스쿼드
  if (game[0].matchingMode === 3) {
    game.map((user, p) => {
      // 이하 각 유저에 대해 수집하는 지표들
      // 1. 등수
      if (user.escapeState === 0) { // 탈출인지 구분
        UpdatedData[user.characterNum - 1].grades[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1][user.gameRank - 1]++;
      } else {
        UpdatedData[user.characterNum - 1].grades[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1][8]++;
      }

      // 2. 점수
      if (user.mmrGain > 0) { // 점수 먹었을 경우
        UpdatedData[user.characterNum - 1].scores[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1][0]++;
      }
      // 점수 먹었던 안먹었던 총 점수변동 반영
      UpdatedData[user.characterNum - 1].scores[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1][1] += user.mmrGain;

      // 3. 평딜
      var targetGameCount: number = 0; // 해당 구간(티어그룹별, 무기별) 판수 카운트
      var beforeVal: number = UpdatedData[user.characterNum - 1].avgdeal[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1];

      UpdatedData[user.characterNum - 1].grades[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1].forEach(element => {
        targetGameCount += element;
      });

      UpdatedData[user.characterNum - 1].avgdeal[getWeaponNum(user.characterNum - 1, user.equipFirstItemForLog[0][0])][getTierGroup(user.mmrBefore) - 1]
        = (beforeVal * (targetGameCount - 1) + user.damageToPlayer) / targetGameCount; // 평딜 구하는 수식

      // 4. TK(팀 킬수)

      // Q. 평딜이랑 TK를 등수별로 수집해야 하는가?
      // 예상 가능한 사용처 - 전적검색 이후 우승시 평딜 , 우승시 팀킬 등으로 캐리력 등 계산
      // A. ?
    })
    append("..완료!");
    rankcount++;
    appendCount('현재 파싱한 랭겜 수 : ' + rankcount);
    appendJSON(JSON.stringify(UpdatedData, null, ''));
  } else if (game[0].matchingMode === 2) { console.log('잇츠일겜'); }
}

function getWeaponNum(charCode: number, firstWeaponCode: number) {
  var WeaponType: string = WeaponData.find(e => e.code === firstWeaponCode)!.weaponType!
  if (CharMastery[charCode].weapon1 == WeaponType) {
    return 0;
  } else if (CharMastery[charCode].weapon2 == WeaponType) {
    return 1;
  } else if (CharMastery[charCode].weapon3 == WeaponType) {
    return 2;
  } else {
    return 3;
  }
}

async function sendAsyncRequests() {
  for (let i = 0; i <= count; i++) {
    try {
      console.log(i + " 드갈게");
      await getGameData(start + i);
    } catch (err) {
      console.log('파싱간 에러로 rejected');
    }
  }
}