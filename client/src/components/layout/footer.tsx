import { Link } from "wouter";
import {
  Award,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-8 mb-8">
          {/* Company Info - Mobile: Left side, Desktop: 2 columns */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/uploads/images/logo_1749658792927.webp"
                alt="BrinaAI 로고"
                className="h-6 lg:h-8 w-auto mr-2 lg:mr-3"
              />
              <span className="text-lg lg:text-xl font-bold">AI교육플랫폼</span>
            </div>
            <div className="text-gray-400 text-xs lg:text-sm space-y-1 lg:space-y-2 mb-4">
              <p className="font-medium text-white">BrainAI</p>
              <p className="hidden lg:block">
                경상남도 진주시 동진로 55, 경상국립대 산학협력관 315호
              </p>
              <p className="lg:hidden">경남 진주시 진주대로 55</p>
              <p className="hidden lg:block">
                대표 : 강미숙 | 사업자 등록번호 : 729-05-02007
              </p>
              <p className="lg:hidden">대표 : 강미숙</p>
              <p className="mt-2 lg:mt-4 text-gray-500 text-xs">
                Copyright © BrainAI. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-3 lg:space-x-4 mb-8 md:mb-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-4 lg:h-5 w-4 lg:w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-4 lg:h-5 w-4 lg:w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-4 lg:h-5 w-4 lg:w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="h-4 lg:h-5 w-4 lg:w-5" />
              </a>
            </div>
          </div>

          {/* Mobile: Right side horizontal scroll, Desktop: 3 columns */}
          <div className="col-span-1 lg:col-span-3">
            {/* Horizontal scrollable container for both mobile and desktop */}
            <div className="flex overflow-x-auto space-x-6 lg:space-x-8 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Services */}
              <div className="flex-shrink-0 min-w-[140px] lg:min-w-[160px]">
                <h4 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-white">
                  서비스
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/courses"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      연수과정
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/seminars"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      학회/세미나
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/study-abroad"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      해외연수
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/training-courses"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      법정의무교육
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/professional-development"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      직무연수
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/certificate-courses"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      자격연수
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="flex-shrink-0 min-w-[140px] lg:min-w-[160px]">
                <h4 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-white">
                  고객지원
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>
                    <Link
                      href="/announcements"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      공지사항
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/help"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/help"
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      원격지원
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="flex-shrink-0 min-w-[160px] lg:min-w-[180px]">
                <h4 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-white">
                  연락처
                </h4>
                <ul className="space-y-2 lg:space-y-3 text-gray-400 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-3 lg:h-4 w-3 lg:w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs lg:text-sm whitespace-nowrap">
                      010-8545-6342
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-3 lg:h-4 w-3 lg:w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs lg:text-sm whitespace-nowrap">
                      dongseom63@gmail.com
                    </span>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-3 lg:h-4 w-3 lg:w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs lg:text-sm">
                      <span className="lg:hidden">경남 진주시</span>
                      <span className="hidden lg:block">
                        경상남도 진주시 동진로 55,
                        <br />
                        경상국립대 산학협력관 315호
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-3 lg:h-4 w-3 lg:w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs lg:text-sm whitespace-nowrap">
                      평일 09:00-18:00
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} AI교육플랫폼. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-gray-400">
              <Link
                href="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                개인정보처리방침
              </Link>
              <span>|</span>
              <Link
                href="/terms-of-service"
                className="hover:text-white transition-colors"
              >
                이용약관
              </Link>
              <span>|</span>
              <Link
                href="/cookie-policy"
                className="hover:text-white transition-colors"
              >
                쿠키정책
              </Link>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>
            사업자등록번호: 470-81-02870 | 대표자: 강미숙 | 통신판매업신고번호:
            2024-경남진주-1234 | 개인정보보호책임자: 강미숙
            (dongseom63@gmail.com)
          </p>
          <p className="mt-1">
            AI교육플랫폼은 교육부에서 인정하는 정식 교원연수기관입니다.
            (인가번호: 교육부-2024-001)
          </p>
        </div>
      </div>
    </footer>
  );
}
