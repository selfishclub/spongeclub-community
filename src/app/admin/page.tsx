"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalMembers: number;
  totalShellsInCirculation: number;
  todayTransactions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="전체 멤버"
          value={stats?.totalMembers ?? "-"}
          href="/admin/members"
        />
        <StatCard
          label="유통 중인 셸"
          value={stats?.totalShellsInCirculation ?? "-"}
          icon="🐚"
        />
        <StatCard
          label="오늘 트랜잭션"
          value={stats?.todayTransactions ?? "-"}
          href="/admin/transactions"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/members"
          className="block bg-white rounded-lg border border-amber-200 p-6 hover:border-amber-400 transition-colors"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            멤버 관리
          </h2>
          <p className="text-amber-700 text-sm">
            멤버 목록 조회, 셸 수동 조정, 트랜잭션 확인
          </p>
        </Link>
        <Link
          href="/admin/members/import"
          className="block bg-white rounded-lg border border-amber-200 p-6 hover:border-amber-400 transition-colors"
        >
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            CSV 일괄 등록
          </h2>
          <p className="text-amber-700 text-sm">
            멤버 CSV 업로드, 가입 보너스 자동 지급
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  icon?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-lg border border-amber-200 p-6">
      <p className="text-sm text-amber-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-amber-900">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
