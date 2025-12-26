'use client';

import * as React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import {
  Root,
  Row,
  Left,
  Right,
  ToggleButton,
  ActiveFiltersContainer,
  ActiveFiltersLabel,
  ActiveFilterChip,
  ClearFiltersButton,
  ToolbarSkeletonRow,
  ToolbarSkeletonPill,
  ToolbarSkeletonInput,
  AiInputContainer,
  AiInputWrapper,
  AiQuestionInput,
  AiInputIcon,
  SuggestionBanner,
  SuggestionIcon,
  SuggestionTexts,
  SuggestionTitle,
  SuggestionBody,
  SuggestionActions,
  SuggestionCloseButton,
  AiSendButtonWrapper,
} from './IndexPageControlToolbar.styled';

import type { IndexPageControlToolbarProps } from './IndexPageControlToolbar.types';
import { AiSendButton, MobixButton, MobixButtonOutlined } from '@/components/mobix/button';
import { FaClockRotateLeftIcon, FaSparklesIcon } from '@/components/icons/FontAwesomeIcons';

const DEFAULT_AI_PLACEHOLDER = 'Pregúntale a Mobix IA...';
const DEFAULT_PRIMARY_ACTION_LABEL = 'Abrir reporte';
const DEFAULT_SECONDARY_ACTION_LABEL = 'Ver analíticas';

export default function IndexPageControlToolbar({
  showStats,
  showFilters,
  showStatsToggle,
  showFiltersToggle,
  activeFiltersDisplay = {},
  onToggleStats,
  onToggleFilters,
  onRemoveFilter,
  onClearAllFilters,
  activeFiltersLabel = 'Filtros activos:',
  isLoading = false,
  aiInputPlaceholder = DEFAULT_AI_PLACEHOLDER,
  aiDefaultQuestion = '',
  aiValue,
  onAiChange,
  onSendQuestion,
  aiSuggestion,
  showAiAssistant = true,
}: IndexPageControlToolbarProps) {
  const hasFiltersDisplay = Object.keys(activeFiltersDisplay).length > 0;
  const [question, setQuestion] = React.useState(aiDefaultQuestion);
  const isControlled = aiValue !== undefined;
  const currentQuestion = isControlled ? aiValue : question;
  const hasSuggestion = Boolean(aiSuggestion?.title || aiSuggestion?.body || aiSuggestion?.actions);

  React.useEffect(() => {
    if (isControlled) return;
    setQuestion(aiDefaultQuestion);
  }, [aiDefaultQuestion, isControlled]);

  const handleSendQuestion = React.useCallback(() => {
    const valueToSend = (currentQuestion ?? '').trim();
    if (!valueToSend) return;
    onSendQuestion?.(valueToSend);
  }, [currentQuestion, onSendQuestion]);

  const handleQuestionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <Root>
      <>
        {isLoading ? (
          <ToolbarSkeletonRow>
            <ToolbarSkeletonPill />
            <ToolbarSkeletonPill />
            {showAiAssistant ? <ToolbarSkeletonInput data-testid="toolbar-skeleton-ai-input" /> : null}
          </ToolbarSkeletonRow>
        ) : (
          <>
            <Row>
              <Left>
                {showStatsToggle && (
                  <ToggleButton
                    variant="outlined"
                    color={showStats ? 'secondary' : 'accent'}
                    onClick={onToggleStats}
                    active={showStats}
                    startIcon={<BarChartIcon />}
                  >
                    Estadísticas
                  </ToggleButton>
                )}

                {showFiltersToggle && (
                  <ToggleButton
                    variant="outlined"
                    color={showFilters ? 'secondary' : 'accent'}
                    onClick={onToggleFilters}
                    active={showFilters}
                    startIcon={<FilterListIcon />}
                  >
                    Filtros
                  </ToggleButton>
                )}
              </Left>

              {showAiAssistant ? (
                <Right>
                  <AiInputWrapper>
                    <AiInputContainer>
                      <AiInputIcon>
                        <FaSparklesIcon color="primary" fontSize="medium" />
                      </AiInputIcon>
                      <AiQuestionInput
                        value={currentQuestion}
                        onChange={(event) => {
                          onAiChange?.(event.target.value);
                          if (!isControlled) setQuestion(event.target.value);
                        }}
                        onKeyDown={handleQuestionKeyDown}
                        placeholder={aiInputPlaceholder}
                        inputProps={{ 'aria-label': 'AI question input' }}
                      />
                      <AiSendButtonWrapper>
                        <AiSendButton
                          aria-label="send question"
                          onClick={handleSendQuestion}
                          sx={{ width: 40, height: 40 }}
                        />
                      </AiSendButtonWrapper>
                    </AiInputContainer>
                  </AiInputWrapper>
                </Right>
              ) : null}
            </Row>

            {showFiltersToggle && hasFiltersDisplay && !hasSuggestion && (
              <ActiveFiltersContainer data-testid="active-filters-chips">
                <ActiveFiltersLabel>{activeFiltersLabel}</ActiveFiltersLabel>
                {Object.entries(activeFiltersDisplay).map(([id, label]) => (
                  <ActiveFilterChip
                    key={id}
                    label={label}
                    onDelete={onRemoveFilter ? () => onRemoveFilter(id) : undefined}
                    data-testid={`active-filter-chip-${id}`}
                  />
                ))}
                {onClearAllFilters && (
                  <ClearFiltersButton
                    size="small"
                    color="secondary"
                    onClick={onClearAllFilters}
                    data-testid="clear-all-filters"
                  >
                    Limpiar filtros
                  </ClearFiltersButton>
                )}
              </ActiveFiltersContainer>
            )}

            {hasSuggestion ? (
              <SuggestionBanner>
                <SuggestionIcon>
                  <FaClockRotateLeftIcon color="primary" fontSize="medium" />
                </SuggestionIcon>
                <SuggestionTexts>
                  {aiSuggestion?.title ? (
                    <SuggestionTitle variant="subtitle2">{aiSuggestion.title}</SuggestionTitle>
                  ) : null}
                  {aiSuggestion?.body ? (
                    <SuggestionBody variant="body2">{aiSuggestion.body}</SuggestionBody>
                  ) : null}
                </SuggestionTexts>
                {aiSuggestion?.actions ? (
                  <SuggestionActions>
                    {aiSuggestion.actions.onPrimary ? (
                      <MobixButton
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowForwardIosIcon fontSize="small" />}
                        onClick={aiSuggestion.actions.onPrimary}
                      >
                        {aiSuggestion.actions.primaryLabel ?? DEFAULT_PRIMARY_ACTION_LABEL}
                      </MobixButton>
                    ) : null}
                    {aiSuggestion.actions.onSecondary ? (
                      <MobixButtonOutlined onClick={aiSuggestion.actions.onSecondary}>
                        {aiSuggestion.actions.secondaryLabel ?? DEFAULT_SECONDARY_ACTION_LABEL}
                      </MobixButtonOutlined>
                    ) : null}
                    {aiSuggestion.actions.onCloseSuggestion ? (
                      <SuggestionCloseButton
                        aria-label="close suggestion"
                        size="small"
                        onClick={aiSuggestion.actions.onCloseSuggestion}
                      >
                        <CloseIcon fontSize="small" />
                      </SuggestionCloseButton>
                    ) : null}
                  </SuggestionActions>
                ) : null}
              </SuggestionBanner>
            ) : null}
          </>
        )}
      </>
    </Root>
  );
}
