import { useRef, useState, type ReactNode } from 'react'

interface VoiceRecognitionAlternative {
  transcript: string
}

type VoiceRecognitionResult = ArrayLike<VoiceRecognitionAlternative>

type VoiceRecognitionResultList = ArrayLike<VoiceRecognitionResult>

interface VoiceRecognitionEvent extends Event {
  results: VoiceRecognitionResultList
}

interface VoiceRecognitionErrorEvent extends Event {
  error: string
}

interface VoiceRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: VoiceRecognitionEvent) => void) | null
  onerror: ((event: VoiceRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type VoiceRecognitionConstructor = new () => VoiceRecognition

declare global {
  interface Window {
    SpeechRecognition?: VoiceRecognitionConstructor
    webkitSpeechRecognition?: VoiceRecognitionConstructor
  }
}

type VoiceSearchButtonProps = {
  buttonClassName?: string
  children?: ReactNode
  label: string
  onTranscript: (transcript: string) => void
}

function VoiceSearchButton({
  buttonClassName,
  children,
  label,
  onTranscript,
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef<VoiceRecognition | null>(null)

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      setError(
        'Este navegador não oferece reconhecimento de voz. Use uma versão atual do Chrome ou Edge.',
      )
      return
    }
    if (!window.isSecureContext) {
      setError('O reconhecimento de voz exige HTTPS ou acesso por localhost.')
      return
    }

    setError('')
    const recognition = new Recognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.trim()
      if (transcript) onTranscript(transcript)
    }
    recognition.onerror = (event) => {
      const errors: Record<string, string> = {
        'not-allowed':
          'Permita o acesso ao microfone nas configurações do navegador e tente novamente.',
        'service-not-allowed':
          'O navegador bloqueou o serviço de reconhecimento de voz.',
        'audio-capture':
          'Nenhum microfone disponível. Confira a entrada de áudio do computador.',
        'no-speech': 'Nenhuma fala foi detectada. Tente falar novamente.',
        network: 'Não foi possível acessar o serviço de reconhecimento de voz.',
      }
      setIsListening(false)
      setError(
        errors[event.error] ??
          'Não foi possível reconhecer a fala. Confira o microfone e tente novamente.',
      )
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch (startError) {
      setIsListening(false)
      setError(
        startError instanceof Error
          ? startError.message
          : 'Não foi possível iniciar o microfone.',
      )
    }
  }

  return (
    <div>
      <button
        aria-label={isListening ? 'Parar reconhecimento de voz' : label}
        aria-pressed={isListening}
        className={buttonClassName}
        onClick={toggleListening}
        type="button"
      >
        {children ?? (isListening ? 'Parar de ouvir' : 'Pesquisar por voz')}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

export default VoiceSearchButton
