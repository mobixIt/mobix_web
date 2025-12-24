'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { aiAssistantDefaults } from './AIAssistantCard.constants';
import {
  CardRoot,
  HeaderRow,
  HeaderTitleGroup,
  IconContainer,
  InputContainer,
  QuestionInput,
  PrimaryActionButton,
  SecondaryActionButton,
  SuggestionActions,
  SuggestionCard,
  SuggestionContent,
  SuggestionHeader,
  SuggestionIcon,
  TextMuted,
  TipRow,
} from './AIAssistantCard.styled';
import type { AIAssistantCardProps } from './AIAssistantCard.types';
import {
  FaBrainIcon,
  FaChartLineIcon,
  FaClockRotateLeftIcon,
  FaFileLinesIcon,
  FaLightbulbIcon,
  FaSparklesIcon,
} from '../icons/FontAwesomeIcons';
import CloseIcon from '@mui/icons-material/Close';
import { AiSendButton } from '../mobix/button';

export function AIAssistantCard({
  title = aiAssistantDefaults.title,
  subtitle = aiAssistantDefaults.subtitle,
  suggestionTitle = aiAssistantDefaults.suggestionTitle,
  suggestionBody = aiAssistantDefaults.suggestionBody,
  actions,
  inputPlaceholder = aiAssistantDefaults.inputPlaceholder,
  tipText = aiAssistantDefaults.tipText,
  defaultQuestion = '',
  onSendQuestion,
}: AIAssistantCardProps) {
  const [question, setQuestion] = React.useState(defaultQuestion);

  const handleSend = React.useCallback(() => {
    if (!question.trim()) return;
    onSendQuestion?.(question.trim());
  }, [onSendQuestion, question]);

  const hasSuggestion = Boolean(suggestionTitle || suggestionBody || actions);

  return (
    <CardRoot>
      <HeaderRow>
        <HeaderTitleGroup>
          <IconContainer>
            <FaBrainIcon color="primary" fontSize="medium" />
          </IconContainer>
          <div>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {title}
            </Typography>
            <TextMuted variant="body2">{subtitle}</TextMuted>
          </div>
        </HeaderTitleGroup>
      </HeaderRow>

      {hasSuggestion ? (
        <SuggestionCard>
          <SuggestionContent>
            <SuggestionIcon>
              <FaClockRotateLeftIcon color="primary" fontSize="medium" />
            </SuggestionIcon>
            <div style={{ flex: 1 }}>
              <SuggestionHeader>
                <div>
                  {suggestionTitle ? (
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {suggestionTitle}
                    </Typography>
                  ) : null}
                  {suggestionBody ? <TextMuted variant="body1">{suggestionBody}</TextMuted> : null}
                </div>
                {actions?.onCloseSuggestion ? (
                  <IconButton
                    size="small"
                    aria-label="close suggestion"
                    onClick={actions.onCloseSuggestion}
                  >
                    <CloseIcon fontSize="medium" />
                  </IconButton>
                ) : null}
              </SuggestionHeader>
              {actions ? (
                <SuggestionActions>
                  <PrimaryActionButton
                    variant="contained"
                    color="primary"
                    startIcon={<FaFileLinesIcon />}
                    onClick={actions.onPrimary}
                  >
                    {actions.primaryLabel ?? aiAssistantDefaults.primaryActionLabel}
                  </PrimaryActionButton>
                  <SecondaryActionButton
                    variant="outlined"
                    color="primary"
                    startIcon={<FaChartLineIcon />}
                    onClick={actions.onSecondary}
                  >
                    {actions.secondaryLabel ?? aiAssistantDefaults.secondaryActionLabel}
                  </SecondaryActionButton>
                </SuggestionActions>
              ) : null}
            </div>
          </SuggestionContent>
        </SuggestionCard>
      ) : null}

      <InputContainer>
        <FaSparklesIcon color="primary" fontSize="medium" />
        <QuestionInput
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={inputPlaceholder}
          inputProps={{ 'aria-label': 'AI question input' }}
        />
        <AiSendButton aria-label="send question" onClick={handleSend} />
      </InputContainer>

      <TipRow>
        <FaLightbulbIcon fontSize="small" color="warning" sx={{ marginTop: '2px' }} />
        <TextMuted variant="caption">{tipText}</TextMuted>
      </TipRow>
    </CardRoot>
  );
}

export default AIAssistantCard;
