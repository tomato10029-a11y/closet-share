export const won=n=>Number(n||0).toLocaleString('ko-KR')+'원';
export const rentOf=p=>Math.round(p*0.1/100)*100;      // 대여가 = 구매가의 10%
export const depositOf=p=>Math.round(p*0.3/1000)*1000; // 보증금 = 구매가의 30% (가설)
export const MAX_PRICE=300000;                         // MVP 등록 가능 구매가 상한
export const CATS=['면접복','졸업·행사','파티'];
export const SIZES=['S','M','L','XL'];
export const ICON={면접복:'jacket','졸업·행사':'dress',파티:'sparkle'}; // 아이콘 이름 (src/icons.jsx)
const mk=(id,name,category,size,price,tone)=>({id,name,category,size,price,rent:rentOf(price),deposit:depositOf(price),cond:'상태 좋음',tone,icon:ICON[category],owner:'경북대 재학생'});
export const ITEMS=[
 mk(1,'네이비 정장 자켓','면접복','M',180000,['#1E3A6E','#3F6BB5']),
 mk(2,'화이트 블라우스','면접복','S',45000,['#C9D8F3','#F3F6FC']),
 mk(3,'검정 슬랙스','면접복','L',70000,['#2A2F3A','#586070']),
 mk(4,'졸업식 원피스','졸업·행사','S',120000,['#B9A4DD','#E8DDF5']),
 mk(5,'체크 정장 세트','면접복','M',250000,['#4A5A78','#9AA8C4']),
 mk(6,'파티 드레스','파티','M',150000,['#C0396B','#F0A3BF']),
];
export const COMP=[
 ['경미한 오염','세탁비만 보증금에서 차감해요.'],
 ['영구 손상(찢김·탈색)','옷 가치의 일정 비율을 보증금에서 차감해요. 등록 때 공개한 기준표대로 적용돼요.'],
 ['미반환','보증금으로 보상하고, 이후 대여가 제한돼요.'],
];
export const STEPS=['대여 요청 완료','대면 인수 확인','반납 확인','보증금 환불 완료'];
export const CHECKS=['옷 상태 사진을 같이 확인했어요','오염·손상 여부를 확인했어요','반납 장소와 시간을 정했어요','세탁 후 반납 규칙을 확인했어요'];
