export const CPP_KEYWORDS = new Set(`
alignas alignof and and_eq asm auto bitand bitor bool break case catch char
char8_t char16_t char32_t class compl concept const consteval constexpr
constinit const_cast continue contract_assert co_await co_return co_yield
decltype default delete do double dynamic_cast else enum explicit export
extern false float for friend goto if inline int long mutable namespace
new noexcept not not_eq nullptr operator or or_eq private protected public
register reinterpret_cast requires return short signed sizeof static
static_assert static_cast struct switch template this thread_local throw
true try typedef typeid typename union unsigned using virtual void volatile
wchar_t while xor xor_eq
`.trim().split(/\s+/));
//стандартные имена в пл.сах
// Эти имена запрещены политикой генератора: std::cin и std::vector,
// main — вход; EOF и NULL могут быть макросами стандартных заголовков.
export const SERVICE_NAMES = new Set(['std', 'main', 'EOF', 'NULL']);

export function isValidName(name: string): boolean {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        return false;
    }
    if (name.includes('__') || /^_[A-Z]/.test(name)) {
        return false;
    }
    return !CPP_KEYWORDS.has(name) && !SERVICE_NAMES.has(name);
}
