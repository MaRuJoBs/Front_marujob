<script setup>
import { computed, useTemplateRef } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCheck,
  faCheckDouble,
  faClock,
  faEllipsis,
  faPen,
  faReply,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { formatTime } from '../lib/format'
import AttachmentView from './AttachmentView.vue'
import ChatVagaCard from './ChatVagaCard.vue'
import ChatAvatar from './ChatAvatar.vue'

const {
  message,
  own = false,
  showAuthor = false,
  status = null,
  fresh = false,
  actionsOpen = false,
} = defineProps({
  message: { type: Object, required: true },
  own: { type: Boolean, default: false },
  // Mostra a foto de quem escreveu na primeira mensagem de cada sequência.
  showAuthor: { type: Boolean, default: false },
  // 'sent' | 'delivered' | 'read' (só nas mensagens próprias).
  status: { type: String, default: null },
  // Mensagem recém-chegada nesta sessão: entra com animação (as do histórico aparecem direto).
  fresh: { type: Boolean, default: false },
  actionsOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['reply', 'edit', 'delete', 'open-image', 'toggle-actions'])

const STATUS_LABEL = {
  sent: 'Enviada',
  delivered: 'Recebida',
  read: 'Lida',
  pending: 'Enviando...',
}

const authorName = computed(() => message.author?.name ?? 'Usuário removido')
const hasActions = computed(() => !message.is_deleted && !message.pending)
const actionsToggle = useTemplateRef('actionsToggle')
// Foto sem texto nem resposta: a bolha vira só uma moldura fina em volta da imagem.
const isPhoto = computed(
  () =>
    Boolean(message.file?.is_image) && !message.body && !message.reply_to && !message.is_deleted,
)
const canEdit = computed(() => own && !message.is_deleted && !message.file)

function closeActions() {
  if (!actionsOpen) return

  emit('toggle-actions')
  actionsToggle.value?.focus()
}

function runAction(action) {
  closeActions()
  emit(action, message)
}

function replyPreview(reply) {
  if (reply.is_deleted) return 'Mensagem apagada'

  return reply.body || (reply.has_file ? 'Anexo' : '')
}
</script>

<template>
  <li
    class="message"
    :class="{
      'message--own': own,
      'message--fresh': fresh,
      'message--pending': status === 'pending',
    }"
    @keydown.esc.stop="closeActions"
  >
    <div class="message__inner">
      <ChatAvatar
        class="message__avatar"
        :class="{ 'message__avatar--hidden': !showAuthor }"
        :name="authorName"
        :src="message.author?.avatar ?? null"
        :size="36"
      />

      <div class="message__main">
        <p v-if="showAuthor && !own" class="message__head">
          <span class="message__author">{{ authorName }}</span>
        </p>

        <div class="message__row">
          <div
            class="message__bubble"
            :tabindex="hasActions ? 0 : undefined"
            :class="{
              'message__bubble--deleted': message.is_deleted,
              'message__bubble--photo': isPhoto,
              'message__bubble--tail': showAuthor,
            }"
          >
            <blockquote v-if="message.reply_to && !message.is_deleted" class="message__reply">
              <strong>{{ message.reply_to.author?.name ?? 'Usuário removido' }}</strong>
              <span>{{ replyPreview(message.reply_to) }}</span>
            </blockquote>

            <ChatVagaCard v-if="message.vaga && !message.is_deleted" :vaga="message.vaga" />

            <p v-if="message.is_deleted" class="message__text">Mensagem apagada</p>
            <template v-else>
              <AttachmentView
                v-if="message.file"
                :message-id="message.id"
                :file="message.file"
                @open="emit('open-image', message)"
              />
              <p v-if="message.body" class="message__text">{{ message.body }}</p>
            </template>

            <span class="message__meta">
              <span v-if="message.edited_at && !message.is_deleted">editada</span>
              <time :datetime="message.created">{{ formatTime(message.created) }}</time>
              <Transition name="tick" mode="out-in">
                <FontAwesomeIcon
                  v-if="own && !message.is_deleted"
                  :key="status"
                  :icon="
                    status === 'pending'
                      ? faClock
                      : status === 'sent' || !status
                        ? faCheck
                        : faCheckDouble
                  "
                  :style="{ fontSize: '13px' }"
                  :class="{ message__read: status === 'read' }"
                  :title="STATUS_LABEL[status] ?? STATUS_LABEL.sent"
                />
              </Transition>
            </span>
          </div>

          <button
            v-if="hasActions"
            ref="actionsToggle"
            type="button"
            class="message__actions-toggle"
            aria-label="Ações da mensagem"
            :aria-expanded="actionsOpen"
            :aria-controls="`message-actions-${message.id}`"
            @click="emit('toggle-actions')"
          >
            <FontAwesomeIcon :icon="faEllipsis" aria-hidden="true" />
          </button>
        </div>

        <div
          v-if="hasActions"
          :id="`message-actions-${message.id}`"
          class="message__actions"
          :class="{ 'message__actions--open': actionsOpen }"
          role="group"
          aria-label="Ações da mensagem"
        >
          <button
            type="button"
            aria-label="Responder"
            title="Responder"
            @click="runAction('reply')"
          >
            <FontAwesomeIcon :icon="faReply" :style="{ fontSize: '15px' }" aria-hidden="true" />
          </button>
          <button
            v-if="canEdit"
            type="button"
            aria-label="Editar"
            title="Editar"
            @click="runAction('edit')"
          >
            <FontAwesomeIcon :icon="faPen" :style="{ fontSize: '15px' }" aria-hidden="true" />
          </button>
          <button
            v-if="own"
            type="button"
            aria-label="Apagar"
            title="Apagar"
            class="message__danger"
            @click="runAction('delete')"
          >
            <FontAwesomeIcon :icon="faTrash" :style="{ fontSize: '15px' }" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
/* Visual do protótipo do MaruJob: balões claros com cantos arredondados, os meus à direita e os
   do outro à esquerda, sem foto/nome ao lado; hora pequena no canto de baixo e tiques em roxo. */
.message {
  list-style: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 1fr;
  max-width: 100%;
}

.message__inner {
  display: flex;
  align-items: flex-start;
  min-height: 0;
  max-width: 100%;
  padding-bottom: 0.75rem;
}

.message--own .message__inner {
  flex-direction: row-reverse;
}

/* Conversa a dois: a foto e o nome já estão no cabeçalho. */
.message__avatar,
.message__head {
  display: none;
}

.message__main {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 78%;
}

.message--own .message__main {
  align-items: flex-end;
  /* Deixa espaço do lado de fora para as três ações (responder/editar/apagar). */
  max-width: 72%;
}

.message__row {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.message--own .message__row {
  flex-direction: row-reverse;
}

.message__bubble {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: min(4.5rem, 100%);
  max-width: 100%;
  padding: 0.5rem 0.75rem 0.375rem;
  color: var(--mrj-color-text, #533581);
  font-size: 0.75rem;
  line-height: 1.4;
  border-radius: 0.75rem;
  background-color: var(--bubble-bg);
  box-shadow: 0 2px 8px rgba(76, 53, 103, 0.08);
  --bubble-bg: var(--chat-bubble, #f6f1fa);
}

.message__bubble:focus-visible {
  outline: var(--mrj-focus-width, 3px) solid var(--mrj-color-focus, #63369e);
  outline-offset: 2px;
}

.message__bubble--deleted {
  color: var(--color-text-secondary);
  font-style: italic;
}

.message__text {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Rodapé do balão: hora no canto de baixo; nas minhas, os tiques à esquerda e a hora à direita. */
.message__meta {
  display: flex;
  align-items: center;
  align-self: stretch;
  justify-content: flex-start;
  gap: 0.375rem;
  color: var(--color-text-secondary);
  font-size: 0.625rem;
}

.message--own .message__meta {
  justify-content: flex-end;
}

.message--own .message__meta svg {
  order: -1;
  margin-right: auto;
  /* Enviada / entregue: cinza. Lida: roxo (abaixo). */
  color: var(--chat-muted, #666b80);
}

.message__meta svg.message__read {
  color: var(--mrj-color-primary, #6e4ab7);
}

/* Foto: a hora fica sobre a imagem (canto inferior direito). */
.message__bubble--photo {
  position: relative;
  width: fit-content;
  min-width: 0;
  padding: 0.1875rem;
  /* Cantos da imagem acompanham os do balão (raio do balão menos a moldura). */
  --attachment-radius: calc(0.75rem - 0.1875rem);
}

.message__bubble--photo .message__meta {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  left: auto;
  align-self: auto;
  padding: 0.0625rem 0.375rem;
  color: #ffffff;
  border-radius: 999px;
  background-color: rgb(0 0 0 / 50%);
}

.message--own .message__bubble--photo .message__meta svg {
  margin-right: 0;
  color: #ffffff;
}

.message__reply {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  border-left: 3px solid var(--mrj-color-primary, #6e4ab7);
  border-radius: var(--radius-sm);
  background-color: var(--mrj-color-secondary, #eae1f3);
}

.message__reply span {
  overflow: hidden;
  color: var(--color-text-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.message__actions-toggle {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 2.75rem;
  height: 2.75rem;
  color: var(--mrj-color-text-secondary, #5c3a8b);
  transform: translateY(-50%);
}

.message--own .message__actions-toggle {
  right: 100%;
  left: auto;
}

.message__actions {
  display: none;
  gap: 0.125rem;
}

.message__actions--open {
  display: flex;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.message--own .message__actions--open {
  align-self: flex-end;
}

@media (hover: hover) and (pointer: fine) {
  .message__actions-toggle {
    display: none;
  }

  .message--own .message__main {
    max-width: min(72%, calc(100% - 5.5rem));
  }

  .message__actions {
    position: absolute;
    top: 50%;
    left: 100%;
    padding-left: 0.375rem;
    transform: translateY(-50%);
  }

  .message--own .message__actions {
    right: 100%;
    left: auto;
    flex-direction: row-reverse;
    padding-right: 0.375rem;
    padding-left: 0;
  }

  .message:hover .message__actions,
  .message:focus-within .message__actions {
    display: flex;
  }
}

.message__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  padding: 0;
  color: var(--mrj-color-text, #533581);
  border: none;
  border-radius: 50%;
  background-color: rgb(255 255 255 / 70%);
  box-shadow: 0 1px 4px rgba(76, 53, 103, 0.12);
  cursor: pointer;
}

@media (hover: none), (pointer: coarse) {
  .message__actions button {
    width: 2.75rem;
    height: 2.75rem;
  }
}

.message__actions button:hover {
  background-color: #ffffff;
}

.message__actions .message__danger:hover {
  color: var(--mrj-color-danger, #b30000);
}

/* Animações: a mensagem nova abre espaço (as de cima sobem) e desliza para o lugar, com fade. */
@media (prefers-reduced-motion: no-preference) {
  .message--fresh {
    animation: message-grow 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .message--fresh .message__inner {
    overflow: hidden;
  }

  .message--fresh .message__main {
    animation: message-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .message--own.message--fresh .message__main {
    animation-name: message-in-own;
  }
}

@keyframes message-grow {
  from {
    grid-template-rows: 0fr;
  }
}

@keyframes message-in {
  from {
    opacity: 0;
    transform: translate(-0.5rem, 1rem);
  }
}

@keyframes message-in-own {
  from {
    opacity: 0;
    transform: translate(0.5rem, 1rem);
  }
}

/* Enviando: o balão fica translúcido até o servidor confirmar, aí "assenta". */
.message--pending .message__bubble {
  opacity: 0.6;
}

.message__bubble {
  transition:
    background-color 0.2s ease,
    opacity 0.35s ease;
}

.tick-enter-active {
  transition:
    transform 0.28s cubic-bezier(0.3, 1.6, 0.5, 1),
    opacity 0.2s ease-out;
}

.tick-leave-active {
  transition:
    transform 0.12s ease-in,
    opacity 0.12s ease-in;
}

.tick-enter-from,
.tick-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.message__actions button {
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.message__actions button:active {
  transform: scale(0.88);
}
</style>
