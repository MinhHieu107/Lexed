const GRADIENTS = [
    "linear-gradient(135deg, #4a6fa5, #2f4d7a)",
    "linear-gradient(135deg, #8c2f2f, #5c1a1a)",
    "linear-gradient(135deg, #3a3a3a, #161616)",
    "linear-gradient(135deg, #2b3a67, #16213e)",
    "linear-gradient(135deg, #2f5d8c, #1a3a5c)",
    "linear-gradient(135deg, #b8860b, #7a5a06)",
    "linear-gradient(135deg, #5a7247, #34421f)"
];

export function gradientForExam(examId, fallbackKey) {

    const id = Number(examId) || Number(fallbackKey) || 1;

    const index = ((id - 1) % GRADIENTS.length + GRADIENTS.length) % GRADIENTS.length;

    return GRADIENTS[index];

}
