import { useEffect, useState } from "react";
import { recordAttempt } from "../services/progressService";

export function useQuestionAnswer(question, onAnswered) {

    const [selected, setSelected] = useState(null);

    useEffect(() => {

        setSelected(question?.already_answered ? question.previous_answer : null);

    }, [question?.id, question?.already_answered, question?.previous_answer]);

    const answer = async (choice) => {

        if (selected || !question || question.already_answered) {
            return;
        }

        setSelected(choice);

        const isCorrect = choice === question.nhan_dinh;

        try {

            await recordAttempt(question.id, isCorrect);

        } catch (err) {

            console.log(err.response?.data);

        }

        if (onAnswered) {
            onAnswered(isCorrect);
        }

    };

    const isRevealed = selected !== null;
    const isCorrect = isRevealed && selected === question?.nhan_dinh;

    return { selected, isRevealed, isCorrect, answer };

}
