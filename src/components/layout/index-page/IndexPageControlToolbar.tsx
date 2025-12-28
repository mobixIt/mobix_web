'use client';

import * as React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { detectPastQuestion } from '@/lib/openai/detectPastQuestion';

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
  aiIsLoading = false,
  showAiAssistant = true,
  aiNoResults,
  aiErrorState,
  aiSuggestion,
  aiHistoricalSuggestion,
}: IndexPageControlToolbarProps) {
  const hasFiltersDisplay = Object.keys(activeFiltersDisplay).length > 0;
  const [question, setQuestion] = React.useState(aiDefaultQuestion);
  const isControlled = aiValue !== undefined;
  const currentQuestion = isControlled ? aiValue : question;
  const hasSuggestion = Boolean(aiSuggestion?.title || aiSuggestion?.body || aiSuggestion?.actions);
  const activeFilterEntries = React.useMemo(() => Object.entries(activeFiltersDisplay), [activeFiltersDisplay]);

  React.useEffect(() => {
    if (isControlled) return;
    setQuestion(aiDefaultQuestion);
  }, [aiDefaultQuestion, isControlled]);

  const [localSuggestion, setLocalSuggestion] = React.useState<IndexPageControlToolbarProps['aiSuggestion']>(undefined);

  const handleSendQuestion = React.useCallback(async () => {
    const valueToSend = (currentQuestion ?? '').trim();
    if (!valueToSend) return;
    const pastResult = await detectPastQuestion(valueToSend);
    if (pastResult.isPast) {
      const suggestion = aiHistoricalSuggestion ?? {
        title: 'Consulta histórica detectada',
        body: 'Podemos abrir el reporte histórico y graficar tendencias para tu consulta.',
        actions: {
          primaryLabel: DEFAULT_PRIMARY_ACTION_LABEL,
          secondaryLabel: DEFAULT_SECONDARY_ACTION_LABEL,
          onPrimary: () => {},
          onSecondary: () => {},
          onCloseSuggestion: () => setLocalSuggestion(undefined),
        },
      };
      setLocalSuggestion(suggestion);
      return;
    }
    setLocalSuggestion(undefined);
    onSendQuestion?.(valueToSend);
  }, [aiHistoricalSuggestion, currentQuestion, onSendQuestion]);

  const handleQuestionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSendQuestion();
    }
  };

  const renderAiBanner = () => {
    const suggestionToShow = aiSuggestion ?? aiHistoricalSuggestion ?? localSuggestion;

    if (suggestionToShow) {
      const actions =
        suggestionToShow.actions ?? {
          primaryLabel: DEFAULT_PRIMARY_ACTION_LABEL,
          secondaryLabel: DEFAULT_SECONDARY_ACTION_LABEL,
          onPrimary: () => {},
          onSecondary: () => {},
        };
      return (
        <SuggestionBanner color="info">
          <SuggestionIcon color="info">
            <FaClockRotateLeftIcon color="primary" fontSize="medium" />
          </SuggestionIcon>
          <SuggestionTexts>
            {suggestionToShow.title ? (
              <SuggestionTitle variant="subtitle2">{suggestionToShow.title}</SuggestionTitle>
            ) : null}
            {suggestionToShow.body ? (
              <SuggestionBody variant="body2">{suggestionToShow.body}</SuggestionBody>
            ) : null}
          </SuggestionTexts>
          <SuggestionActions>
            {actions.onPrimary ? (
              <MobixButton
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                onClick={actions.onPrimary}
              >
                {actions.primaryLabel ?? DEFAULT_PRIMARY_ACTION_LABEL}
              </MobixButton>
            ) : null}
            {actions.onSecondary ? (
              <MobixButtonOutlined onClick={actions.onSecondary}>
                {actions.secondaryLabel ?? DEFAULT_SECONDARY_ACTION_LABEL}
              </MobixButtonOutlined>
            ) : null}
            {actions.onCloseSuggestion ? (
              <SuggestionCloseButton
                aria-label="close suggestion"
                size="small"
                onClick={actions.onCloseSuggestion}
              >
                <CloseIcon fontSize="small" />
              </SuggestionCloseButton>
            ) : null}
          </SuggestionActions>
        </SuggestionBanner>
      );
    }

    if (aiErrorState?.show) {
      return (
        <SuggestionBanner color="error">
          <SuggestionIcon color="error">
            <ReportProblemOutlinedIcon color="error" fontSize="medium" />
          </SuggestionIcon>
          <SuggestionTexts>
            <SuggestionTitle variant="subtitle2">
              {aiErrorState.message ?? 'Tuvimos un problema al procesar tu consulta. ¿Probamos de nuevo?'}
            </SuggestionTitle>
            <SuggestionBody variant="body2">
              {aiErrorState.hint ?? 'Revisa tu conexión o intenta con otra frase.'}
            </SuggestionBody>
            {aiErrorState.note ? (
              <SuggestionBody variant="body2">{aiErrorState.note}</SuggestionBody>
            ) : null}
          </SuggestionTexts>
          <SuggestionActions>
            {aiErrorState.onRetry ? (
              <MobixButton
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                onClick={aiErrorState.onRetry}
              >
                Intentar de nuevo
              </MobixButton>
            ) : null}
            {aiErrorState.onClear ? (
              <MobixButtonOutlined onClick={aiErrorState.onClear}>
                Ver todos
              </MobixButtonOutlined>
            ) : null}
          </SuggestionActions>
        </SuggestionBanner>
      );
    }

    if (aiNoResults?.show) {
      return (
        <SuggestionBanner>
          <SuggestionIcon>
            <InfoOutlinedIcon color="primary" fontSize="medium" />
          </SuggestionIcon>
          <SuggestionTexts>
            <SuggestionTitle variant="subtitle2">
              {aiNoResults.message ?? 'No pude encontrar nada con lo que me diste. ¿Probamos con más detalle?'}
            </SuggestionTitle>
            <SuggestionBody variant="body2">
              {aiNoResults.hint ?? 'Me ayudan detalles como marca, año o color.'}
            </SuggestionBody>
            {aiNoResults.note ? (
              <SuggestionBody variant="body2">{aiNoResults.note}</SuggestionBody>
            ) : null}
          </SuggestionTexts>
          <SuggestionActions>
            {aiNoResults.onRetry ? (
              <MobixButton
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                onClick={aiNoResults.onRetry}
              >
                Intentar de nuevo
              </MobixButton>
            ) : null}
            {aiNoResults.onClear ? (
              <MobixButtonOutlined onClick={aiNoResults.onClear}>
                Ver todos
              </MobixButtonOutlined>
            ) : null}
          </SuggestionActions>
        </SuggestionBanner>
      );
    }

    return null;
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
                      disabled={aiIsLoading}
                    />
                    <AiSendButtonWrapper>
                      <AiSendButton
                        aria-label="send question"
                        onClick={handleSendQuestion}
                        sx={{ width: 40, height: 40 }}
                        isLoading={aiIsLoading}
                        disabled={aiIsLoading}
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
                {activeFilterEntries.map(([id, label]) => (
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

            {renderAiBanner()}
          </>
        )}
      </>
    </Root>
  );
}
