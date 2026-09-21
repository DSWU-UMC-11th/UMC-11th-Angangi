"use strict";
const members = [
    { id: 1, name: "양서윤", role: "admin", githubId: "yangyangeeee" },
    { id: 2, name: "김민준", role: "member" },
    { id: 3, name: "이하늘", role: "guest", githubId: "haneul-dev" },
];
function findMember(id) {
    return members.find((member) => member.id === id);
}
function describeMember(id) {
    const member = findMember(id);
    if (!member) {
        return `ID ${id}에 해당하는 회원을 찾을 수 없습니다.`;
    }
    const githubInfo = member.githubId ?? "등록된 GitHub 아이디 없음";
    return `[${member.role}] ${member.name} (GitHub: ${githubInfo})`;
}
[1, 2, 999].forEach((id) => {
    console.log(describeMember(id));
});
