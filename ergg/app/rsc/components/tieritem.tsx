'use client'

import { useState } from "react";
import { getColor } from "../libs/assets";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TierItem({ char, position }: any) {
  const [animate, setAnimate] = useState('hidden');
  const data = char; // 받아온 값들
  const p = position; // 번호임 그냥

  const color = getColor(data.tier);

  return (
    <motion.div className="tierlist_item_wrap"
      whileTap={{ scale: 0.98 }}
      // onHoverStart={e => { setAnimate("visible") }}
      // onHoverEnd={e => { setAnimate("hidden") }}
      >
      <motion.div className={`absolute flex flex-row justify-end w-full h-full items-center ${color} rounded-xl py-2`}
        variants={{
          hidden: { opacity: 1, x: "-101%" },
          visible: { opacity: 1, x: 0 }
        }}
        initial="hidden"
        transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
        animate={animate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" className="p-2 w-10 h-10" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" viewBox="0 0 16 16"
          onClick={()=>setAnimate('hidden')}>
            <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z" />
          </svg>
        <Link href="/page2" className="" >
        <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" className="mr-3 p-2 w-10 h-10" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z" />
          <path fill-rule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z" />
        </svg>
        </Link>
      </motion.div>
      <motion.div
        className="tierlist_item_hover_textdiv"
        variants={{
          hidden: { opacity: 0, y: "-100%", x: `${65}px` },
          visible: { opacity: 1, y: 0, x: `${65}px` }
        }}
        initial="hidden"
        transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
        animate={animate}>
        <div className="tierlist_item_hover_text">
          <div>평균 딜량</div>
          <div>{data.data === undefined ? 0 : Math.floor(data.data.avgdealbygrade[0] * 10) / 10}</div>
        </div>
        <div className="tierlist_item_hover_text">
          <div>평균 순위</div>
          <div>{data.data === undefined ? 0 : Math.floor(data.data.avggrade * 100) / 100 + "위"}</div>
        </div>
        <div className="tierlist_item_hover_text">
          <div>평균 팀킬</div>
          <div>{data.data === undefined ? 0 : Math.floor(data.data.tkbygrade[0] * 100) / 100}</div>
        </div>
        <div className="tierlist_item_hover_text">
          <div>점수 변동</div>
          <div>{data.data === undefined ? 0 : Math.floor(data.data.sbscore / data.data.gamecountbygrade[0] * 100) / 100}</div>
        </div>
        <div className="tierlist_item_hover_text">
          <div>탈출 확률</div>
          <div>{data.data === undefined ? 0 : Math.floor(data.data.gamecountbygrade[9] / data.data.gamecountbygrade[0] * 100) + "%"}</div>
        </div>
      </motion.div>
      <div className="flex flex-row items-center w-full h-full" onClick={()=>setAnimate('visible')}>
      <div className="w-[12%] text-center font-mb text-lg border-r border-stone-400">{p + 1}</div>
      <div className="flex flex-row min-w-[42%] items-center text-md h-full gap-x-2 pl-2">
        <motion.div
          variants={{
            hidden: { opacity: 1, x: "0" },
            visible: { opacity: 1, x: "-60px" }
          }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          animate={animate}
          className="charicon_dir scale-[90%]">
          <img className="charicon" src={`/characters/${data.code}.webp`} />
        </motion.div>
        <div className="font-mr w-[80%] border-r text-sm border-stone-400">{data.weapon + " " + data.name}</div>
      </div>
      <div className="w-[12%] text-center border-r text-sm border-stone-400">{data.WR}%</div>
      <div className="w-[12%] text-center border-r text-sm border-stone-400">{data.PR}%</div>
      <div className="w-[12%] text-center border-r text-sm border-stone-400">{data.SR}%</div>
      <div className="w-[12%] px-2">
        <p className={`rounded-xl text-center text-md font-mb text-white ` + color}>{data.tier === 0 ? 'OP' : data.tier}</p>
      </div>
      </div>
    </motion.div >);
}