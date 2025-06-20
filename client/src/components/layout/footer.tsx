import { Link } from "wouter";
import { Award, Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/attached_assets/logo_1749658792927_1750413164821.webp" 
                alt="Jinuchem 로고" 
                className="h-8 w-auto mr-3"
              />
              <span className="text-xl font-bold">연수플랫폼</span>
            </div>
            <div className="text-gray-400 text-sm space-y-2 mb-4">
              <p className="font-medium text-white">(주)지누켐</p>
              <p>경상남도 진주시 진주대로 501, 창업보육센터 B동 202호</p>
              <p>대표 : 김병선 | 사업자 등록번호 : 470-81-02870</p>
              <p className="mt-4 text-gray-500">Copyright © Jinuchem All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/courses">
                  <a className="hover:text-white transition-colors cursor-pointer">연수과정</a>
                </Link>
              </li>
              <li>
                <Link href="/seminars">
                  <a className="hover:text-white transition-colors cursor-pointer">학회/세미나</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">해외연수</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">자격증과정</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">화학물질교육</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">공지사항</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">1:1 문의</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">원격지원</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">이용약관</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">개인정보처리방침</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">연락처</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>055-772-2226</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>bkim@jinuchem.co.kr</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>경상남도 진주시 진주대로 501<br />창업보육센터 B동 202호</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>평일 09:00-18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} 한국연수교육플랫폼. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">쿠키정책</a>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>
            사업자등록번호: 123-45-67890 | 대표자: 김교육 | 통신판매업신고번호: 2024-서울강남-1234 | 
            개인정보보호책임자: 이관리 (privacy@eduplatform.kr)
          </p>
          <p className="mt-1">
            한국연수교육플랫폼은 교육부에서 인정하는 정식 교원연수기관입니다. (인가번호: 교육부-2024-001)
          </p>
        </div>
      </div>
    </footer>
  );
}
