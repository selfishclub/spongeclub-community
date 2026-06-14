"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

// Import all certificate components
import BaejjangCertificate from "../_members/baejjang";
import AmyCertificate from "../_members/amy";
import NamuCertificate from "../_members/namu";
import ModakCertificate from "../_members/modak";
import MintCertificate from "../_members/mint";
import SolCertificate from "../_members/sol";
import AgataCertificate from "../_members/agata";
import YusCertificate from "../_members/yus";
import EdenCertificate from "../_members/eden";
import JackCertificate from "../_members/jack";
import ChesterCertificate from "../_members/chester";
// 2조
import RaelCertificate from "../_members/rael";
import MaraCertificate from "../_members/mara";
import ParkKSCertificate from "../_members/parkks";
import BomCertificate from "../_members/bom";
import SlowquickCertificate from "../_members/slowquick";
import IniCertificate from "../_members/ini";
import IoCertificate from "../_members/io";
import JejeCertificate from "../_members/jeje";
import PhonometerCertificate from "../_members/phonometer";
import PinoCertificate from "../_members/pino";
import HikariCertificate from "../_members/hikari";
// 3조
import NinaCertificate2 from "../_members/nina";
import PpuccaCertificate from "../_members/ppucca";
import GaemiCertificate from "../_members/gaemi";
import GreenCertificate from "../_members/green";
import LindiCertificate from "../_members/lindi";
import SeolrokCertificate from "../_members/seolrok";
import ShinYSCertificate from "../_members/shinys";
import YuliaCertificate from "../_members/yulia";
import JiniCertificate from "../_members/jini";
import ChikoCertificate from "../_members/chiko";
import KoniCertificate from "../_members/koni";
// 4조
import JjiniCertificate from "../_members/jjini";
import YongsCertificate from "../_members/yongs";
import GooseCertificate from "../_members/goose";
import MoongreenCertificate from "../_members/moongreen";
import RiboCertificate from "../_members/ribo";
import RinCertificate from "../_members/rin";
import MunjiminCertificate from "../_members/munjimin";
import ParkRuaCertificate from "../_members/parkrua";
import SeolMJCertificate from "../_members/seolmj";
import AceCertificate from "../_members/ace";
import JungminCertificate from "../_members/jungmin";
// 5조
import ArtreeCertificate from "../_members/artree";
import TurtleCertificate from "../_members/turtle";
import DuksuCertificate from "../_members/duksu";
import RoykangCertificate from "../_members/roykang";
import ParksimCertificate from "../_members/parksim";
import BomiCertificate from "../_members/bomi";
import VickyCertificate from "../_members/vicky";
import SunnyCertificate from "../_members/sunny";
import IanCertificate from "../_members/ian";
import KinoCertificate from "../_members/kino";
import HazelCertificate from "../_members/hazel";
// 6조
import GaliaCertificate from "../_members/galia";
import Hook2Certificate from "../_members/hook2";
import MemberJCertificate from "../_members/memberj";
import LaraCertificate from "../_members/lara";
import RayCertificate from "../_members/ray";
import SeokyingCertificate from "../_members/seokying";
import IrisCertificate from "../_members/iris";
import ChoboCertificate from "../_members/chobo";
import HaneulCertificate from "../_members/haneul";
import HoneybarnCertificate from "../_members/honeybarn";
import HiyamCertificate from "../_members/hiyam";

// Registry: slug -> component
const CERTIFICATES: Record<string, React.ComponentType> = {
  "배짱-박종배": BaejjangCertificate,
  "amy": AmyCertificate,
  "나무-김남욱": NamuCertificate,
  "모닥": ModakCertificate,
  "민트-최서진": MintCertificate,
  "솔-임솔": SolCertificate,
  "아가타": AgataCertificate,
  "유스": YusCertificate,
  "이든": EdenCertificate,
  "잭": JackCertificate,
  "체스터-이상윤": ChesterCertificate,
  // 2조
  "라엘": RaelCertificate,
  "마라": MaraCertificate,
  "박경선": ParkKSCertificate,
  "봄-김연미": BomCertificate,
  "슬로우퀵-박은아": SlowquickCertificate,
  "이니": IniCertificate,
  "이오-오국봉": IoCertificate,
  "제제-최지예": JejeCertificate,
  "포노미터-김미라": PhonometerCertificate,
  "피노": PinoCertificate,
  "히카리-윤준영": HikariCertificate,
  // 3조
  "nina-이예지": NinaCertificate2,
  "ppucca": PpuccaCertificate,
  "개미-임종범": GaemiCertificate,
  "그린-이유경": GreenCertificate,
  "린디": LindiCertificate,
  "설록-권효선": SeolrokCertificate,
  "신연수": ShinYSCertificate,
  "율리아-조유리": YuliaCertificate,
  "지니": JiniCertificate,
  "치코-김나영": ChikoCertificate,
  "코니-황초롱": KoniCertificate,
  // 4조
  "4조-지니-신진영": JjiniCertificate,
  "yongs-전용규": YongsCertificate,
  "거위의꿈": GooseCertificate,
  "달빛그린": MoongreenCertificate,
  "리보-이보경": RiboCertificate,
  "린": RinCertificate,
  "먼지민-석지민": MunjiminCertificate,
  "박루아": ParkRuaCertificate,
  "설민주": SeolMJCertificate,
  "에이스-최학곤": AceCertificate,
  "정민": JungminCertificate,
  // 5조
  "artree": ArtreeCertificate,
  "거북이-나병우": TurtleCertificate,
  "덕수-김효정": DuksuCertificate,
  "로이캉": RoykangCertificate,
  "박상임": ParksimCertificate,
  "보미": BomiCertificate,
  "비키-서승리": VickyCertificate,
  "써니": SunnyCertificate,
  "이안-박민우": IanCertificate,
  "키노-강은주": KinoCertificate,
  "헤이즐-성윤재": HazelCertificate,
  // 6조
  "galia-방경은": GaliaCertificate,
  "hook2-이창환": Hook2Certificate,
  "j": MemberJCertificate,
  "라라": LaraCertificate,
  "레이": RayCertificate,
  "석영": SeokyingCertificate,
  "아이리스-이선애": IrisCertificate,
  "초보자": ChoboCertificate,
  "하늘": HaneulCertificate,
  "허니바른": HoneybarnCertificate,
  "히얌": HiyamCertificate,
};

// slug → DB member name mapping
import membersData from "../members-data.json";
const SLUG_TO_NAME: Record<string, string> = {};
for (const m of membersData as { slug: string; name: string }[]) {
  SLUG_TO_NAME[m.slug] = m.name;
}

const RANK_LABELS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-amber-600 to-amber-700"];

export default function CertificatePage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const [rank, setRank] = useState<number | null>(null);

  const memberName = SLUG_TO_NAME[name];

  useEffect(() => {
    fetch("/api/ranking?type=ranking")
      .then((r) => r.json())
      .then((data) => {
        const top3 = (data.ranking || []).slice(0, 3);
        const found = top3.find((r: { name: string }) => r.name === memberName);
        if (found) setRank(found.rank);
      })
      .catch(() => {});
  }, [memberName]);

  const Component = CERTIFICATES[name];

  if (!Component) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🧽</p>
          <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-2">준비 중이에요</h1>
          <p className="text-sm text-[var(--ink-50)] mb-6">이 수료증은 아직 제작 중입니다.</p>
          <Link href="/certificate" className="text-sm font-bold text-[var(--yellow)] hover:underline">
            ← 전체 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {rank && rank <= 3 && (
        <div className="sticky top-0 z-50">
          <div className={`bg-gradient-to-r ${RANK_COLORS[rank - 1]} text-white text-center py-3 px-4 shadow-md`}>
            <p className="text-sm font-extrabold">
              {RANK_LABELS[rank - 1]} 누적 활동 랭킹 {rank}위
            </p>
          </div>
        </div>
      )}
      <Component />
    </div>
  );
}
