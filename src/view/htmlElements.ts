import { ConfigurableElement, UseCase, UseItem } from "./render/viewRenderer.js";
import { GetState, Stateful } from "../store/index.js";
import { SpecialElementAttributes } from "./specialAttributes.js";
import { ElementSupport } from "./elementSupport.js";

export type HTMLView = (root: HTMLBuilder) => void;
export type TagElement<T extends string> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement;

export interface HTMLCaseMatcher<T> {
    when<X extends T>(typePredicate: (val: T) => val is X, generator: (useCase: UseCase<X>) => HTMLView): HTMLCaseMatcher<T>;
    default(generator: (useCase: UseCase<T>) => HTMLView): void;
}

export interface HTMLConditionMatcher {
    when(predicate: (get: GetState) => boolean, view: HTMLView): HTMLConditionMatcher;
    default(view: HTMLView): void;
}

export interface HTMLViewMatcher {
    withUnion<T>(unionValue: (get: GetState) => T): HTMLCaseMatcher<T>;
    withConditions(): HTMLConditionMatcher;
}

export interface SpecialHTMLElements {
    element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLBuilder>) => void, support?: ElementSupport): this;
    textNode(value: string | Stateful<string | undefined>): this;
    subview(value: HTMLView): this;
    subviewMatching(matcherGenerator: (matcher: HTMLViewMatcher) => void): this;
    subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (useItem: UseItem<T>) => HTMLView): this;
}

export interface GlobalHTMLAttributes {
    accesskey(value: string | Stateful<string | undefined>): this;
    autocapitalize(value: string | Stateful<string | undefined>): this;
    autocorrect(value: string | Stateful<string | undefined>): this;
    autofocus(value: boolean | Stateful<boolean | undefined>): this;
    class(value: string | Stateful<string | undefined>): this;
    contenteditable(value: string | Stateful<string | undefined>): this;
    dir(value: string | Stateful<string | undefined>): this;
    draggable(value: string | Stateful<string | undefined>): this;
    enterkeyhint(value: string | Stateful<string | undefined>): this;
    exportparts(value: string | Stateful<string | undefined>): this;
    hidden(value: string | Stateful<string | undefined>): this;
    id(value: string | Stateful<string | undefined>): this;
    inert(value: boolean | Stateful<boolean | undefined>): this;
    inputmode(value: string | Stateful<string | undefined>): this;
    is(value: string | Stateful<string | undefined>): this;
    itemid(value: string | Stateful<string | undefined>): this;
    itemprop(value: string | Stateful<string | undefined>): this;
    itemref(value: string | Stateful<string | undefined>): this;
    itemscope(value: boolean | Stateful<boolean | undefined>): this;
    itemtype(value: string | Stateful<string | undefined>): this;
    lang(value: string | Stateful<string | undefined>): this;
    nonce(value: string | Stateful<string | undefined>): this;
    part(value: string | Stateful<string | undefined>): this;
    popover(value: string | Stateful<string | undefined>): this;
    slot(value: string | Stateful<string | undefined>): this;
    spellcheck(value: string | Stateful<string | undefined>): this;
    style(value: string | Stateful<string | undefined>): this;
    tabindex(value: string | Stateful<string | undefined>): this;
    title(value: string | Stateful<string | undefined>): this;
    translate(value: string | Stateful<string | undefined>): this;
    writingsuggestions(value: string | Stateful<string | undefined>): this;
    role(value: string | Stateful<string | undefined>): this;
}

export interface HTMLBuilder extends SpecialHTMLElements {
    a(builder?: (element: ConfigurableElement<AElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes, never>) => void): HTMLBuilder;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    b(builder?: (element: ConfigurableElement<BElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes, never>) => void): HTMLBuilder;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    br(builder?: (element: ConfigurableElement<BrElementAttributes, never>) => void): HTMLBuilder;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    col(builder?: (element: ConfigurableElement<ColElementAttributes, never>) => void): HTMLBuilder;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    data(builder?: (element: ConfigurableElement<DataElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    del(builder?: (element: ConfigurableElement<DelElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    div(builder?: (element: ConfigurableElement<DivElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    em(builder?: (element: ConfigurableElement<EmElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes, never>) => void): HTMLBuilder;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    form(builder?: (element: ConfigurableElement<FormElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes, never>) => void): HTMLBuilder;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    i(builder?: (element: ConfigurableElement<IElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes, never>) => void): HTMLBuilder;
    input(builder?: (element: ConfigurableElement<InputElementAttributes, never>) => void): HTMLBuilder;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    li(builder?: (element: ConfigurableElement<LiElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes, never>) => void): HTMLBuilder;
    main(builder?: (element: ConfigurableElement<MainElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    map(builder?: (element: ConfigurableElement<MapElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    math(builder?: (element: ConfigurableElement<MathElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes, never>) => void): HTMLBuilder;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes, never>) => void): HTMLBuilder;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    p(builder?: (element: ConfigurableElement<PElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes, never>) => void): HTMLBuilder;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    q(builder?: (element: ConfigurableElement<QElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    s(builder?: (element: ConfigurableElement<SElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes, never>) => void): HTMLBuilder;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    table(builder?: (element: ConfigurableElement<TableElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    td(builder?: (element: ConfigurableElement<TdElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    th(builder?: (element: ConfigurableElement<ThElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes, never>) => void): HTMLBuilder;
    u(builder?: (element: ConfigurableElement<UElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    var(builder?: (element: ConfigurableElement<VarElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes, HTMLBuilder>) => void): HTMLBuilder;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes, never>) => void): HTMLBuilder;
}

export interface AElementAttributes extends SpecialElementAttributes<TagElement<"a">>, GlobalHTMLAttributes {
    charset(value: string | Stateful<string | undefined>): AElementAttributes;
    coords(value: string | Stateful<string | undefined>): AElementAttributes;
    download(value: string | Stateful<string | undefined>): AElementAttributes;
    href(value: string | Stateful<string | undefined>): AElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): AElementAttributes;
    name(value: string | Stateful<string | undefined>): AElementAttributes;
    ping(value: string | Stateful<string | undefined>): AElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): AElementAttributes;
    rel(value: string | Stateful<string | undefined>): AElementAttributes;
    rev(value: string | Stateful<string | undefined>): AElementAttributes;
    shape(value: string | Stateful<string | undefined>): AElementAttributes;
    target(value: string | Stateful<string | undefined>): AElementAttributes;
    type(value: string | Stateful<string | undefined>): AElementAttributes;
}

export interface AbbrElementAttributes extends SpecialElementAttributes<TagElement<"abbr">>, GlobalHTMLAttributes {
}

export interface AddressElementAttributes extends SpecialElementAttributes<TagElement<"address">>, GlobalHTMLAttributes {
}

export interface AreaElementAttributes extends SpecialElementAttributes<TagElement<"area">>, GlobalHTMLAttributes {
    alt(value: string | Stateful<string | undefined>): AreaElementAttributes;
    coords(value: string | Stateful<string | undefined>): AreaElementAttributes;
    download(value: string | Stateful<string | undefined>): AreaElementAttributes;
    href(value: string | Stateful<string | undefined>): AreaElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): AreaElementAttributes;
    nohref(value: string | Stateful<string | undefined>): AreaElementAttributes;
    ping(value: string | Stateful<string | undefined>): AreaElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): AreaElementAttributes;
    rel(value: string | Stateful<string | undefined>): AreaElementAttributes;
    shape(value: string | Stateful<string | undefined>): AreaElementAttributes;
    target(value: string | Stateful<string | undefined>): AreaElementAttributes;
    type(value: string | Stateful<string | undefined>): AreaElementAttributes;
}

export interface ArticleElementAttributes extends SpecialElementAttributes<TagElement<"article">>, GlobalHTMLAttributes {
}

export interface AsideElementAttributes extends SpecialElementAttributes<TagElement<"aside">>, GlobalHTMLAttributes {
}

export interface AudioElementAttributes extends SpecialElementAttributes<TagElement<"audio">>, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    controls(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): AudioElementAttributes;
    loop(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    muted(value: boolean | Stateful<boolean | undefined>): AudioElementAttributes;
    preload(value: string | Stateful<string | undefined>): AudioElementAttributes;
    src(value: string | Stateful<string | undefined>): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialElementAttributes<TagElement<"b">>, GlobalHTMLAttributes {
}

export interface BaseElementAttributes extends SpecialElementAttributes<TagElement<"base">>, GlobalHTMLAttributes {
    href(value: string | Stateful<string | undefined>): BaseElementAttributes;
    target(value: string | Stateful<string | undefined>): BaseElementAttributes;
}

export interface BdiElementAttributes extends SpecialElementAttributes<TagElement<"bdi">>, GlobalHTMLAttributes {
}

export interface BdoElementAttributes extends SpecialElementAttributes<TagElement<"bdo">>, GlobalHTMLAttributes {
}

export interface BlockquoteElementAttributes extends SpecialElementAttributes<TagElement<"blockquote">>, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialElementAttributes<TagElement<"body">>, GlobalHTMLAttributes {
    alink(value: string | Stateful<string | undefined>): BodyElementAttributes;
    background(value: string | Stateful<string | undefined>): BodyElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): BodyElementAttributes;
    link(value: string | Stateful<string | undefined>): BodyElementAttributes;
    text(value: string | Stateful<string | undefined>): BodyElementAttributes;
    vlink(value: string | Stateful<string | undefined>): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialElementAttributes<TagElement<"br">>, GlobalHTMLAttributes {
    clear(value: string | Stateful<string | undefined>): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialElementAttributes<TagElement<"button">>, GlobalHTMLAttributes {
    command(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    commandfor(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): ButtonElementAttributes;
    form(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formaction(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formenctype(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formmethod(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean | undefined>): ButtonElementAttributes;
    formtarget(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    name(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    popovertarget(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    popovertargetaction(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    type(value: string | Stateful<string | undefined>): ButtonElementAttributes;
    value(value: string | Stateful<string | undefined>): ButtonElementAttributes;
}

export interface CanvasElementAttributes extends SpecialElementAttributes<TagElement<"canvas">>, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): CanvasElementAttributes;
    width(value: string | Stateful<string | undefined>): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialElementAttributes<TagElement<"caption">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): CaptionElementAttributes;
}

export interface CiteElementAttributes extends SpecialElementAttributes<TagElement<"cite">>, GlobalHTMLAttributes {
}

export interface CodeElementAttributes extends SpecialElementAttributes<TagElement<"code">>, GlobalHTMLAttributes {
}

export interface ColElementAttributes extends SpecialElementAttributes<TagElement<"col">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ColElementAttributes;
    char(value: string | Stateful<string | undefined>): ColElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ColElementAttributes;
    span(value: string | Stateful<string | undefined>): ColElementAttributes;
    valign(value: string | Stateful<string | undefined>): ColElementAttributes;
    width(value: string | Stateful<string | undefined>): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialElementAttributes<TagElement<"colgroup">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    char(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    span(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    valign(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
    width(value: string | Stateful<string | undefined>): ColgroupElementAttributes;
}

export interface DataElementAttributes extends SpecialElementAttributes<TagElement<"data">>, GlobalHTMLAttributes {
    value(value: string | Stateful<string | undefined>): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialElementAttributes<TagElement<"datalist">>, GlobalHTMLAttributes {
}

export interface DdElementAttributes extends SpecialElementAttributes<TagElement<"dd">>, GlobalHTMLAttributes {
}

export interface DelElementAttributes extends SpecialElementAttributes<TagElement<"del">>, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): DelElementAttributes;
    datetime(value: string | Stateful<string | undefined>): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialElementAttributes<TagElement<"details">>, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): DetailsElementAttributes;
    open(value: boolean | Stateful<boolean | undefined>): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialElementAttributes<TagElement<"dfn">>, GlobalHTMLAttributes {
}

export interface DialogElementAttributes extends SpecialElementAttributes<TagElement<"dialog">>, GlobalHTMLAttributes {
    closedby(value: string | Stateful<string | undefined>): DialogElementAttributes;
    open(value: boolean | Stateful<boolean | undefined>): DialogElementAttributes;
}

export interface DivElementAttributes extends SpecialElementAttributes<TagElement<"div">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialElementAttributes<TagElement<"dl">>, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialElementAttributes<TagElement<"dt">>, GlobalHTMLAttributes {
}

export interface EmElementAttributes extends SpecialElementAttributes<TagElement<"em">>, GlobalHTMLAttributes {
}

export interface EmbedElementAttributes extends SpecialElementAttributes<TagElement<"embed">>, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    src(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    type(value: string | Stateful<string | undefined>): EmbedElementAttributes;
    width(value: string | Stateful<string | undefined>): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialElementAttributes<TagElement<"fieldset">>, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): FieldsetElementAttributes;
    form(value: string | Stateful<string | undefined>): FieldsetElementAttributes;
    name(value: string | Stateful<string | undefined>): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialElementAttributes<TagElement<"figcaption">>, GlobalHTMLAttributes {
}

export interface FigureElementAttributes extends SpecialElementAttributes<TagElement<"figure">>, GlobalHTMLAttributes {
}

export interface FooterElementAttributes extends SpecialElementAttributes<TagElement<"footer">>, GlobalHTMLAttributes {
}

export interface FormElementAttributes extends SpecialElementAttributes<TagElement<"form">>, GlobalHTMLAttributes {
    accept(value: string | Stateful<string | undefined>): FormElementAttributes;
    acceptCharset(value: string | Stateful<string | undefined>): FormElementAttributes;
    action(value: string | Stateful<string | undefined>): FormElementAttributes;
    autocomplete(value: string | Stateful<string | undefined>): FormElementAttributes;
    enctype(value: string | Stateful<string | undefined>): FormElementAttributes;
    method(value: string | Stateful<string | undefined>): FormElementAttributes;
    name(value: string | Stateful<string | undefined>): FormElementAttributes;
    novalidate(value: boolean | Stateful<boolean | undefined>): FormElementAttributes;
    target(value: string | Stateful<string | undefined>): FormElementAttributes;
}

export interface H1ElementAttributes extends SpecialElementAttributes<TagElement<"h1">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialElementAttributes<TagElement<"h2">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialElementAttributes<TagElement<"h3">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialElementAttributes<TagElement<"h4">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialElementAttributes<TagElement<"h5">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialElementAttributes<TagElement<"h6">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialElementAttributes<TagElement<"head">>, GlobalHTMLAttributes {
    profile(value: string | Stateful<string | undefined>): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialElementAttributes<TagElement<"header">>, GlobalHTMLAttributes {
}

export interface HgroupElementAttributes extends SpecialElementAttributes<TagElement<"hgroup">>, GlobalHTMLAttributes {
}

export interface HrElementAttributes extends SpecialElementAttributes<TagElement<"hr">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): HrElementAttributes;
    noshade(value: string | Stateful<string | undefined>): HrElementAttributes;
    size(value: string | Stateful<string | undefined>): HrElementAttributes;
    width(value: string | Stateful<string | undefined>): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialElementAttributes<TagElement<"html">>, GlobalHTMLAttributes {
    manifest(value: string | Stateful<string | undefined>): HtmlElementAttributes;
    version(value: string | Stateful<string | undefined>): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialElementAttributes<TagElement<"i">>, GlobalHTMLAttributes {
}

export interface IframeElementAttributes extends SpecialElementAttributes<TagElement<"iframe">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allow(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allowfullscreen(value: boolean | Stateful<boolean | undefined>): IframeElementAttributes;
    allowpaymentrequest(value: string | Stateful<string | undefined>): IframeElementAttributes;
    allowusermedia(value: string | Stateful<string | undefined>): IframeElementAttributes;
    frameborder(value: string | Stateful<string | undefined>): IframeElementAttributes;
    height(value: string | Stateful<string | undefined>): IframeElementAttributes;
    loading(value: string | Stateful<string | undefined>): IframeElementAttributes;
    longdesc(value: string | Stateful<string | undefined>): IframeElementAttributes;
    marginheight(value: string | Stateful<string | undefined>): IframeElementAttributes;
    marginwidth(value: string | Stateful<string | undefined>): IframeElementAttributes;
    name(value: string | Stateful<string | undefined>): IframeElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): IframeElementAttributes;
    sandbox(value: string | Stateful<string | undefined>): IframeElementAttributes;
    scrolling(value: string | Stateful<string | undefined>): IframeElementAttributes;
    src(value: string | Stateful<string | undefined>): IframeElementAttributes;
    srcdoc(value: string | Stateful<string | undefined>): IframeElementAttributes;
    width(value: string | Stateful<string | undefined>): IframeElementAttributes;
}

export interface ImgElementAttributes extends SpecialElementAttributes<TagElement<"img">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ImgElementAttributes;
    alt(value: string | Stateful<string | undefined>): ImgElementAttributes;
    border(value: string | Stateful<string | undefined>): ImgElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): ImgElementAttributes;
    decoding(value: string | Stateful<string | undefined>): ImgElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): ImgElementAttributes;
    height(value: string | Stateful<string | undefined>): ImgElementAttributes;
    hspace(value: string | Stateful<string | undefined>): ImgElementAttributes;
    ismap(value: boolean | Stateful<boolean | undefined>): ImgElementAttributes;
    loading(value: string | Stateful<string | undefined>): ImgElementAttributes;
    longdesc(value: string | Stateful<string | undefined>): ImgElementAttributes;
    name(value: string | Stateful<string | undefined>): ImgElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): ImgElementAttributes;
    sizes(value: string | Stateful<string | undefined>): ImgElementAttributes;
    src(value: string | Stateful<string | undefined>): ImgElementAttributes;
    srcset(value: string | Stateful<string | undefined>): ImgElementAttributes;
    usemap(value: string | Stateful<string | undefined>): ImgElementAttributes;
    vspace(value: string | Stateful<string | undefined>): ImgElementAttributes;
    width(value: string | Stateful<string | undefined>): ImgElementAttributes;
}

export interface InputElementAttributes extends SpecialElementAttributes<TagElement<"input">>, GlobalHTMLAttributes {
    accept(value: string | Stateful<string | undefined>): InputElementAttributes;
    align(value: string | Stateful<string | undefined>): InputElementAttributes;
    alpha(value: string | Stateful<string | undefined>): InputElementAttributes;
    alt(value: string | Stateful<string | undefined>): InputElementAttributes;
    autocomplete(value: string | Stateful<string | undefined>): InputElementAttributes;
    checked(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    colorspace(value: string | Stateful<string | undefined>): InputElementAttributes;
    dirname(value: string | Stateful<string | undefined>): InputElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    form(value: string | Stateful<string | undefined>): InputElementAttributes;
    formaction(value: string | Stateful<string | undefined>): InputElementAttributes;
    formenctype(value: string | Stateful<string | undefined>): InputElementAttributes;
    formmethod(value: string | Stateful<string | undefined>): InputElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    formtarget(value: string | Stateful<string | undefined>): InputElementAttributes;
    height(value: string | Stateful<string | undefined>): InputElementAttributes;
    ismap(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    list(value: string | Stateful<string | undefined>): InputElementAttributes;
    max(value: string | Stateful<string | undefined>): InputElementAttributes;
    maxlength(value: string | Stateful<string | undefined>): InputElementAttributes;
    min(value: string | Stateful<string | undefined>): InputElementAttributes;
    minlength(value: string | Stateful<string | undefined>): InputElementAttributes;
    multiple(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    name(value: string | Stateful<string | undefined>): InputElementAttributes;
    pattern(value: string | Stateful<string | undefined>): InputElementAttributes;
    placeholder(value: string | Stateful<string | undefined>): InputElementAttributes;
    popovertarget(value: string | Stateful<string | undefined>): InputElementAttributes;
    popovertargetaction(value: string | Stateful<string | undefined>): InputElementAttributes;
    readonly(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): InputElementAttributes;
    size(value: string | Stateful<string | undefined>): InputElementAttributes;
    src(value: string | Stateful<string | undefined>): InputElementAttributes;
    step(value: string | Stateful<string | undefined>): InputElementAttributes;
    type(value: string | Stateful<string | undefined>): InputElementAttributes;
    usemap(value: string | Stateful<string | undefined>): InputElementAttributes;
    value(value: string | Stateful<string | undefined>): InputElementAttributes;
    width(value: string | Stateful<string | undefined>): InputElementAttributes;
}

export interface InsElementAttributes extends SpecialElementAttributes<TagElement<"ins">>, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): InsElementAttributes;
    datetime(value: string | Stateful<string | undefined>): InsElementAttributes;
}

export interface KbdElementAttributes extends SpecialElementAttributes<TagElement<"kbd">>, GlobalHTMLAttributes {
}

export interface LabelElementAttributes extends SpecialElementAttributes<TagElement<"label">>, GlobalHTMLAttributes {
    for(value: string | Stateful<string | undefined>): LabelElementAttributes;
    form(value: string | Stateful<string | undefined>): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialElementAttributes<TagElement<"legend">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialElementAttributes<TagElement<"li">>, GlobalHTMLAttributes {
    type(value: string | Stateful<string | undefined>): LiElementAttributes;
    value(value: string | Stateful<string | undefined>): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialElementAttributes<TagElement<"link">>, GlobalHTMLAttributes {
    as(value: string | Stateful<string | undefined>): LinkElementAttributes;
    blocking(value: string | Stateful<string | undefined>): LinkElementAttributes;
    charset(value: string | Stateful<string | undefined>): LinkElementAttributes;
    color(value: string | Stateful<string | undefined>): LinkElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): LinkElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): LinkElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): LinkElementAttributes;
    href(value: string | Stateful<string | undefined>): LinkElementAttributes;
    hreflang(value: string | Stateful<string | undefined>): LinkElementAttributes;
    imagesizes(value: string | Stateful<string | undefined>): LinkElementAttributes;
    imagesrcset(value: string | Stateful<string | undefined>): LinkElementAttributes;
    integrity(value: string | Stateful<string | undefined>): LinkElementAttributes;
    media(value: string | Stateful<string | undefined>): LinkElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): LinkElementAttributes;
    rel(value: string | Stateful<string | undefined>): LinkElementAttributes;
    rev(value: string | Stateful<string | undefined>): LinkElementAttributes;
    sizes(value: string | Stateful<string | undefined>): LinkElementAttributes;
    target(value: string | Stateful<string | undefined>): LinkElementAttributes;
    type(value: string | Stateful<string | undefined>): LinkElementAttributes;
}

export interface MainElementAttributes extends SpecialElementAttributes<TagElement<"main">>, GlobalHTMLAttributes {
}

export interface MapElementAttributes extends SpecialElementAttributes<TagElement<"map">>, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialElementAttributes<TagElement<"mark">>, GlobalHTMLAttributes {
}

export interface MathElementAttributes extends SpecialElementAttributes<TagElement<"math">>, GlobalHTMLAttributes {
}

export interface MenuElementAttributes extends SpecialElementAttributes<TagElement<"menu">>, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialElementAttributes<TagElement<"menuitem">>, GlobalHTMLAttributes {
}

export interface MetaElementAttributes extends SpecialElementAttributes<TagElement<"meta">>, GlobalHTMLAttributes {
    charset(value: string | Stateful<string | undefined>): MetaElementAttributes;
    content(value: string | Stateful<string | undefined>): MetaElementAttributes;
    httpEquiv(value: string | Stateful<string | undefined>): MetaElementAttributes;
    media(value: string | Stateful<string | undefined>): MetaElementAttributes;
    name(value: string | Stateful<string | undefined>): MetaElementAttributes;
    scheme(value: string | Stateful<string | undefined>): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialElementAttributes<TagElement<"meter">>, GlobalHTMLAttributes {
    high(value: string | Stateful<string | undefined>): MeterElementAttributes;
    low(value: string | Stateful<string | undefined>): MeterElementAttributes;
    max(value: string | Stateful<string | undefined>): MeterElementAttributes;
    min(value: string | Stateful<string | undefined>): MeterElementAttributes;
    optimum(value: string | Stateful<string | undefined>): MeterElementAttributes;
    value(value: string | Stateful<string | undefined>): MeterElementAttributes;
}

export interface NavElementAttributes extends SpecialElementAttributes<TagElement<"nav">>, GlobalHTMLAttributes {
}

export interface NoscriptElementAttributes extends SpecialElementAttributes<TagElement<"noscript">>, GlobalHTMLAttributes {
}

export interface ObjectElementAttributes extends SpecialElementAttributes<TagElement<"object">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    archive(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    border(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    classid(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    codebase(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    codetype(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    data(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    declare(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    form(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    height(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    hspace(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    name(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    standby(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    type(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    typemustmatch(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    usemap(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    vspace(value: string | Stateful<string | undefined>): ObjectElementAttributes;
    width(value: string | Stateful<string | undefined>): ObjectElementAttributes;
}

export interface OlElementAttributes extends SpecialElementAttributes<TagElement<"ol">>, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): OlElementAttributes;
    reversed(value: boolean | Stateful<boolean | undefined>): OlElementAttributes;
    start(value: string | Stateful<string | undefined>): OlElementAttributes;
    type(value: string | Stateful<string | undefined>): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialElementAttributes<TagElement<"optgroup">>, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): OptgroupElementAttributes;
    label(value: string | Stateful<string | undefined>): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialElementAttributes<TagElement<"option">>, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean | undefined>): OptionElementAttributes;
    label(value: string | Stateful<string | undefined>): OptionElementAttributes;
    selected(value: boolean | Stateful<boolean | undefined>): OptionElementAttributes;
    value(value: string | Stateful<string | undefined>): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialElementAttributes<TagElement<"output">>, GlobalHTMLAttributes {
    for(value: string | Stateful<string | undefined>): OutputElementAttributes;
    form(value: string | Stateful<string | undefined>): OutputElementAttributes;
    name(value: string | Stateful<string | undefined>): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialElementAttributes<TagElement<"p">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialElementAttributes<TagElement<"param">>, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): ParamElementAttributes;
    type(value: string | Stateful<string | undefined>): ParamElementAttributes;
    value(value: string | Stateful<string | undefined>): ParamElementAttributes;
    valuetype(value: string | Stateful<string | undefined>): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialElementAttributes<TagElement<"picture">>, GlobalHTMLAttributes {
}

export interface PreElementAttributes extends SpecialElementAttributes<TagElement<"pre">>, GlobalHTMLAttributes {
    width(value: string | Stateful<string | undefined>): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialElementAttributes<TagElement<"progress">>, GlobalHTMLAttributes {
    max(value: string | Stateful<string | undefined>): ProgressElementAttributes;
    value(value: string | Stateful<string | undefined>): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialElementAttributes<TagElement<"q">>, GlobalHTMLAttributes {
    cite(value: string | Stateful<string | undefined>): QElementAttributes;
}

export interface RbElementAttributes extends SpecialElementAttributes<TagElement<"rb">>, GlobalHTMLAttributes {
}

export interface RpElementAttributes extends SpecialElementAttributes<TagElement<"rp">>, GlobalHTMLAttributes {
}

export interface RtElementAttributes extends SpecialElementAttributes<TagElement<"rt">>, GlobalHTMLAttributes {
}

export interface RtcElementAttributes extends SpecialElementAttributes<TagElement<"rtc">>, GlobalHTMLAttributes {
}

export interface RubyElementAttributes extends SpecialElementAttributes<TagElement<"ruby">>, GlobalHTMLAttributes {
}

export interface SElementAttributes extends SpecialElementAttributes<TagElement<"s">>, GlobalHTMLAttributes {
}

export interface SampElementAttributes extends SpecialElementAttributes<TagElement<"samp">>, GlobalHTMLAttributes {
}

export interface ScriptElementAttributes extends SpecialElementAttributes<TagElement<"script">>, GlobalHTMLAttributes {
    async(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    blocking(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    charset(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    defer(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    fetchpriority(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    integrity(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    language(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    nomodule(value: boolean | Stateful<boolean | undefined>): ScriptElementAttributes;
    referrerpolicy(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    src(value: string | Stateful<string | undefined>): ScriptElementAttributes;
    type(value: string | Stateful<string | undefined>): ScriptElementAttributes;
}

export interface SearchElementAttributes extends SpecialElementAttributes<TagElement<"search">>, GlobalHTMLAttributes {
}

export interface SectionElementAttributes extends SpecialElementAttributes<TagElement<"section">>, GlobalHTMLAttributes {
}

export interface SelectElementAttributes extends SpecialElementAttributes<TagElement<"select">>, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string | undefined>): SelectElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    form(value: string | Stateful<string | undefined>): SelectElementAttributes;
    multiple(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    name(value: string | Stateful<string | undefined>): SelectElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): SelectElementAttributes;
    size(value: string | Stateful<string | undefined>): SelectElementAttributes;
}

export interface SlotElementAttributes extends SpecialElementAttributes<TagElement<"slot">>, GlobalHTMLAttributes {
    name(value: string | Stateful<string | undefined>): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialElementAttributes<TagElement<"small">>, GlobalHTMLAttributes {
}

export interface SourceElementAttributes extends SpecialElementAttributes<TagElement<"source">>, GlobalHTMLAttributes {
    height(value: string | Stateful<string | undefined>): SourceElementAttributes;
    media(value: string | Stateful<string | undefined>): SourceElementAttributes;
    sizes(value: string | Stateful<string | undefined>): SourceElementAttributes;
    src(value: string | Stateful<string | undefined>): SourceElementAttributes;
    srcset(value: string | Stateful<string | undefined>): SourceElementAttributes;
    type(value: string | Stateful<string | undefined>): SourceElementAttributes;
    width(value: string | Stateful<string | undefined>): SourceElementAttributes;
}

export interface SpanElementAttributes extends SpecialElementAttributes<TagElement<"span">>, GlobalHTMLAttributes {
}

export interface StrongElementAttributes extends SpecialElementAttributes<TagElement<"strong">>, GlobalHTMLAttributes {
}

export interface StyleElementAttributes extends SpecialElementAttributes<TagElement<"style">>, GlobalHTMLAttributes {
    blocking(value: string | Stateful<string | undefined>): StyleElementAttributes;
    media(value: string | Stateful<string | undefined>): StyleElementAttributes;
    type(value: string | Stateful<string | undefined>): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialElementAttributes<TagElement<"sub">>, GlobalHTMLAttributes {
}

export interface SummaryElementAttributes extends SpecialElementAttributes<TagElement<"summary">>, GlobalHTMLAttributes {
}

export interface SupElementAttributes extends SpecialElementAttributes<TagElement<"sup">>, GlobalHTMLAttributes {
}

export interface TableElementAttributes extends SpecialElementAttributes<TagElement<"table">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TableElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TableElementAttributes;
    border(value: string | Stateful<string | undefined>): TableElementAttributes;
    cellpadding(value: string | Stateful<string | undefined>): TableElementAttributes;
    cellspacing(value: string | Stateful<string | undefined>): TableElementAttributes;
    frame(value: string | Stateful<string | undefined>): TableElementAttributes;
    rules(value: string | Stateful<string | undefined>): TableElementAttributes;
    summary(value: string | Stateful<string | undefined>): TableElementAttributes;
    width(value: string | Stateful<string | undefined>): TableElementAttributes;
}

export interface TbodyElementAttributes extends SpecialElementAttributes<TagElement<"tbody">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    char(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TbodyElementAttributes;
    valign(value: string | Stateful<string | undefined>): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialElementAttributes<TagElement<"td">>, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string | undefined>): TdElementAttributes;
    align(value: string | Stateful<string | undefined>): TdElementAttributes;
    axis(value: string | Stateful<string | undefined>): TdElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TdElementAttributes;
    char(value: string | Stateful<string | undefined>): TdElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TdElementAttributes;
    colspan(value: string | Stateful<string | undefined>): TdElementAttributes;
    headers(value: string | Stateful<string | undefined>): TdElementAttributes;
    height(value: string | Stateful<string | undefined>): TdElementAttributes;
    nowrap(value: string | Stateful<string | undefined>): TdElementAttributes;
    rowspan(value: string | Stateful<string | undefined>): TdElementAttributes;
    scope(value: string | Stateful<string | undefined>): TdElementAttributes;
    valign(value: string | Stateful<string | undefined>): TdElementAttributes;
    width(value: string | Stateful<string | undefined>): TdElementAttributes;
}

export interface TemplateElementAttributes extends SpecialElementAttributes<TagElement<"template">>, GlobalHTMLAttributes {
    shadowrootclonable(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootcustomelementregistry(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootdelegatesfocus(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootmode(value: string | Stateful<string | undefined>): TemplateElementAttributes;
    shadowrootserializable(value: string | Stateful<string | undefined>): TemplateElementAttributes;
}

export interface TextareaElementAttributes extends SpecialElementAttributes<TagElement<"textarea">>, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    cols(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    dirname(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    disabled(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    form(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    maxlength(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    minlength(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    name(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    placeholder(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    readonly(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    required(value: boolean | Stateful<boolean | undefined>): TextareaElementAttributes;
    rows(value: string | Stateful<string | undefined>): TextareaElementAttributes;
    wrap(value: string | Stateful<string | undefined>): TextareaElementAttributes;
}

export interface TfootElementAttributes extends SpecialElementAttributes<TagElement<"tfoot">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TfootElementAttributes;
    char(value: string | Stateful<string | undefined>): TfootElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TfootElementAttributes;
    valign(value: string | Stateful<string | undefined>): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialElementAttributes<TagElement<"th">>, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string | undefined>): ThElementAttributes;
    align(value: string | Stateful<string | undefined>): ThElementAttributes;
    axis(value: string | Stateful<string | undefined>): ThElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): ThElementAttributes;
    char(value: string | Stateful<string | undefined>): ThElementAttributes;
    charoff(value: string | Stateful<string | undefined>): ThElementAttributes;
    colspan(value: string | Stateful<string | undefined>): ThElementAttributes;
    headers(value: string | Stateful<string | undefined>): ThElementAttributes;
    height(value: string | Stateful<string | undefined>): ThElementAttributes;
    nowrap(value: string | Stateful<string | undefined>): ThElementAttributes;
    rowspan(value: string | Stateful<string | undefined>): ThElementAttributes;
    scope(value: string | Stateful<string | undefined>): ThElementAttributes;
    valign(value: string | Stateful<string | undefined>): ThElementAttributes;
    width(value: string | Stateful<string | undefined>): ThElementAttributes;
}

export interface TheadElementAttributes extends SpecialElementAttributes<TagElement<"thead">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TheadElementAttributes;
    char(value: string | Stateful<string | undefined>): TheadElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TheadElementAttributes;
    valign(value: string | Stateful<string | undefined>): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialElementAttributes<TagElement<"time">>, GlobalHTMLAttributes {
    datetime(value: string | Stateful<string | undefined>): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialElementAttributes<TagElement<"title">>, GlobalHTMLAttributes {
}

export interface TrElementAttributes extends SpecialElementAttributes<TagElement<"tr">>, GlobalHTMLAttributes {
    align(value: string | Stateful<string | undefined>): TrElementAttributes;
    bgcolor(value: string | Stateful<string | undefined>): TrElementAttributes;
    char(value: string | Stateful<string | undefined>): TrElementAttributes;
    charoff(value: string | Stateful<string | undefined>): TrElementAttributes;
    valign(value: string | Stateful<string | undefined>): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialElementAttributes<TagElement<"track">>, GlobalHTMLAttributes {
    default(value: boolean | Stateful<boolean | undefined>): TrackElementAttributes;
    kind(value: string | Stateful<string | undefined>): TrackElementAttributes;
    label(value: string | Stateful<string | undefined>): TrackElementAttributes;
    src(value: string | Stateful<string | undefined>): TrackElementAttributes;
    srclang(value: string | Stateful<string | undefined>): TrackElementAttributes;
}

export interface UElementAttributes extends SpecialElementAttributes<TagElement<"u">>, GlobalHTMLAttributes {
}

export interface UlElementAttributes extends SpecialElementAttributes<TagElement<"ul">>, GlobalHTMLAttributes {
    compact(value: string | Stateful<string | undefined>): UlElementAttributes;
    type(value: string | Stateful<string | undefined>): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialElementAttributes<TagElement<"var">>, GlobalHTMLAttributes {
}

export interface VideoElementAttributes extends SpecialElementAttributes<TagElement<"video">>, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    controls(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    crossorigin(value: string | Stateful<string | undefined>): VideoElementAttributes;
    height(value: string | Stateful<string | undefined>): VideoElementAttributes;
    loop(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    muted(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    playsinline(value: boolean | Stateful<boolean | undefined>): VideoElementAttributes;
    poster(value: string | Stateful<string | undefined>): VideoElementAttributes;
    preload(value: string | Stateful<string | undefined>): VideoElementAttributes;
    src(value: string | Stateful<string | undefined>): VideoElementAttributes;
    width(value: string | Stateful<string | undefined>): VideoElementAttributes;
}

export interface WbrElementAttributes extends SpecialElementAttributes<TagElement<"wbr">>, GlobalHTMLAttributes {
}
