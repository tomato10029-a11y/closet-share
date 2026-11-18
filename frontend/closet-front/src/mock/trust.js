// 별점·후기·대여 횟수. 백엔드에는 아직 이 값이 없어서 지금은 프론트의 샘플 데이터예요.
// 옷 id와 이름이 둘 다 맞을 때만 적용해요. (새로 등록한 옷에 샘플 이력이 붙지 않게 하려는 장치)
// 여기에 없는 옷(예: 파티 드레스)과 새로 등록한 옷은 "새 옷"으로 보여요.
// 사고 = 반납 때 오염·손상으로 보증금이 차감된 대여.
const SAMPLE = {
  1: {name: '네이비 정장 자켓', rentals: 9, incidents: 0, reviews: [
    {stars: 5, text: '사이즈가 사진이랑 똑같고 세탁도 깨끗하게 돼 있었어요. 면접 잘 보고 왔어요!'},
    {stars: 5, text: '소매 길이가 딱 맞았어요. 인수 시간도 잘 지켜 주셔서 편했어요.'},
    {stars: 4, text: '상태 좋아요. 안감이 조금 구겨져 있어서 다려서 입었어요.'},
  ]},
  2: {name: '화이트 블라우스', rentals: 6, incidents: 0, reviews: [
    {stars: 5, text: '얇지 않고 비침도 없어서 면접용으로 딱이었어요.'},
    {stars: 4, text: '깔끔해요. 단추 하나가 살짝 헐거워서 받을 때 말씀드렸어요.'},
  ]},
  3: {name: '검정 슬랙스', rentals: 4, incidents: 1, reviews: [
    {stars: 4, text: '허리 핏이 잘 맞고 구김이 없어요.'},
    {stars: 3, text: '밑단이 길어서 신발 신고 보니 조금 끌렸어요. 수선은 안 돼서 아쉬웠어요.'},
  ]},
  4: {name: '졸업식 원피스', rentals: 3, incidents: 0, reviews: [
    {stars: 5, text: '졸업사진 찍을 때 입었는데 사진이 잘 나왔어요.'},
  ]},
  5: {name: '체크 정장 세트', rentals: 2, incidents: 0, reviews: [
    {stars: 5, text: '세트로 한 번에 빌릴 수 있어서 편했어요. 면접 날 아침에 급하게 부탁했는데도 응해 주셨어요.'},
  ]},
};

export function trustOf(item) {
  const s = item && SAMPLE[item.id];
  const t = s && s.name === item.name ? s : null;
  const reviews = t ? t.reviews : [];
  const rentals = t ? t.rentals : 0;
  const incidents = t ? t.incidents : 0;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.stars, 0) / reviews.length : null;
  return {rentals, incidents, reviews, avg, isNew: rentals === 0};
}
