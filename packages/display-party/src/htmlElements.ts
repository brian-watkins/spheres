import { ViewElement, SpecialElements, SpecialAttributes } from "./view.js";
import { StoreMessage } from "state-party";

export interface AriaAttributes {
    ariaActivedescendant(value: string): this;
    ariaAtomic(value: string): this;
    ariaAutocomplete(value: string): this;
    ariaBusy(value: string): this;
    ariaChecked(value: string): this;
    ariaColcount(value: string): this;
    ariaColindex(value: string): this;
    ariaColspan(value: string): this;
    ariaControls(value: string): this;
    ariaCurrent(value: string): this;
    ariaDescribedby(value: string): this;
    ariaDetails(value: string): this;
    ariaDisabled(value: string): this;
    ariaDropeffect(value: string): this;
    ariaErrormessage(value: string): this;
    ariaExpanded(value: string): this;
    ariaFlowto(value: string): this;
    ariaGrabbed(value: string): this;
    ariaHaspopup(value: string): this;
    ariaHidden(value: string): this;
    ariaInvalid(value: string): this;
    ariaKeyshortcuts(value: string): this;
    ariaLabel(value: string): this;
    ariaLabelledby(value: string): this;
    ariaLevel(value: string): this;
    ariaLive(value: string): this;
    ariaModal(value: string): this;
    ariaMultiline(value: string): this;
    ariaMultiselectable(value: string): this;
    ariaOrientation(value: string): this;
    ariaOwns(value: string): this;
    ariaPlaceholder(value: string): this;
    ariaPosinset(value: string): this;
    ariaPressed(value: string): this;
    ariaReadonly(value: string): this;
    ariaRelevant(value: string): this;
    ariaRequired(value: string): this;
    ariaRoledescription(value: string): this;
    ariaRowcount(value: string): this;
    ariaRowindex(value: string): this;
    ariaRowspan(value: string): this;
    ariaSelected(value: string): this;
    ariaSetsize(value: string): this;
    ariaSort(value: string): this;
    ariaValuemax(value: string): this;
    ariaValuemin(value: string): this;
    ariaValuenow(value: string): this;
    ariaValuetext(value: string): this;
    role(value: string): this;
}

export interface GlobalAttributes extends AriaAttributes {
    accesskey(value: string): this;
    autocapitalize(value: string): this;
    autofocus(value: boolean): this;
    contenteditable(value: string): this;
    dir(value: string): this;
    draggable(value: string): this;
    enterkeyhint(value: string): this;
    hidden(value: string): this;
    id(value: string): this;
    inert(value: boolean): this;
    inputmode(value: string): this;
    is(value: string): this;
    itemid(value: string): this;
    itemprop(value: string): this;
    itemref(value: string): this;
    itemscope(value: boolean): this;
    itemtype(value: string): this;
    lang(value: string): this;
    nonce(value: string): this;
    popover(value: string): this;
    slot(value: string): this;
    spellcheck(value: string): this;
    style(value: string): this;
    tabindex(value: string): this;
    title(value: string): this;
    translate(value: string): this;
    onAbort<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onAfterprint<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onAuxclick<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onBeforematch<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onBeforeprint<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onBeforeunload<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onBlur<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCancel<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCanplay<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCanplaythrough<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onChange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onClick<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onClose<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onContextlost<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onContextmenu<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onContextrestored<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCopy<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCuechange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onCut<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDblclick<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDrag<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDragend<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDragenter<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDragleave<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDragover<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDragstart<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDrop<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onDurationchange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onEmptied<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onEnded<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onError<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onFocus<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onFormdata<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onHashchange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onInput<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onInvalid<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onKeydown<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onKeypress<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onKeyup<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onLanguagechange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onLoad<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onLoadeddata<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onLoadedmetadata<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onLoadstart<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMessage<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMessageerror<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMousedown<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMouseenter<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMouseleave<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMousemove<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMouseout<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMouseover<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onMouseup<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onOffline<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onOnline<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPagehide<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPageshow<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPaste<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPause<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPlay<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPlaying<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onPopstate<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onProgress<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onRatechange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onRejectionhandled<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onReset<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onResize<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onScroll<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onScrollend<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSecuritypolicyviolation<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSeeked<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSeeking<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSelect<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSlotchange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onStalled<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onStorage<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSubmit<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onSuspend<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onTimeupdate<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onToggle<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onUnhandledrejection<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onUnload<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onVolumechange<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onWaiting<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
    onWheel<M extends StoreMessage<any>>(handler: <E extends Event>(evt: E) => M): this;
}

export interface ViewElements extends SpecialElements {
    a(builder?: (element: ViewElement<AElementAttributes>) => void): this;
    abbr(builder?: (element: ViewElement<AbbrElementAttributes>) => void): this;
    acronym(builder?: (element: ViewElement<AcronymElementAttributes>) => void): this;
    address(builder?: (element: ViewElement<AddressElementAttributes>) => void): this;
    applet(builder?: (element: ViewElement<AppletElementAttributes>) => void): this;
    area(builder?: (element: ViewElement<AreaElementAttributes>) => void): this;
    article(builder?: (element: ViewElement<ArticleElementAttributes>) => void): this;
    aside(builder?: (element: ViewElement<AsideElementAttributes>) => void): this;
    audio(builder?: (element: ViewElement<AudioElementAttributes>) => void): this;
    b(builder?: (element: ViewElement<BElementAttributes>) => void): this;
    base(builder?: (element: ViewElement<BaseElementAttributes>) => void): this;
    basefont(builder?: (element: ViewElement<BasefontElementAttributes>) => void): this;
    bdi(builder?: (element: ViewElement<BdiElementAttributes>) => void): this;
    bdo(builder?: (element: ViewElement<BdoElementAttributes>) => void): this;
    bgsound(builder?: (element: ViewElement<BgsoundElementAttributes>) => void): this;
    big(builder?: (element: ViewElement<BigElementAttributes>) => void): this;
    blink(builder?: (element: ViewElement<BlinkElementAttributes>) => void): this;
    blockquote(builder?: (element: ViewElement<BlockquoteElementAttributes>) => void): this;
    body(builder?: (element: ViewElement<BodyElementAttributes>) => void): this;
    br(builder?: (element: ViewElement<BrElementAttributes>) => void): this;
    button(builder?: (element: ViewElement<ButtonElementAttributes>) => void): this;
    canvas(builder?: (element: ViewElement<CanvasElementAttributes>) => void): this;
    caption(builder?: (element: ViewElement<CaptionElementAttributes>) => void): this;
    center(builder?: (element: ViewElement<CenterElementAttributes>) => void): this;
    cite(builder?: (element: ViewElement<CiteElementAttributes>) => void): this;
    code(builder?: (element: ViewElement<CodeElementAttributes>) => void): this;
    col(builder?: (element: ViewElement<ColElementAttributes>) => void): this;
    colgroup(builder?: (element: ViewElement<ColgroupElementAttributes>) => void): this;
    command(builder?: (element: ViewElement<CommandElementAttributes>) => void): this;
    content(builder?: (element: ViewElement<ContentElementAttributes>) => void): this;
    data(builder?: (element: ViewElement<DataElementAttributes>) => void): this;
    datalist(builder?: (element: ViewElement<DatalistElementAttributes>) => void): this;
    dd(builder?: (element: ViewElement<DdElementAttributes>) => void): this;
    del(builder?: (element: ViewElement<DelElementAttributes>) => void): this;
    details(builder?: (element: ViewElement<DetailsElementAttributes>) => void): this;
    dfn(builder?: (element: ViewElement<DfnElementAttributes>) => void): this;
    dialog(builder?: (element: ViewElement<DialogElementAttributes>) => void): this;
    dir(builder?: (element: ViewElement<DirElementAttributes>) => void): this;
    div(builder?: (element: ViewElement<DivElementAttributes>) => void): this;
    dl(builder?: (element: ViewElement<DlElementAttributes>) => void): this;
    dt(builder?: (element: ViewElement<DtElementAttributes>) => void): this;
    element(builder?: (element: ViewElement<ElementElementAttributes>) => void): this;
    em(builder?: (element: ViewElement<EmElementAttributes>) => void): this;
    embed(builder?: (element: ViewElement<EmbedElementAttributes>) => void): this;
    fieldset(builder?: (element: ViewElement<FieldsetElementAttributes>) => void): this;
    figcaption(builder?: (element: ViewElement<FigcaptionElementAttributes>) => void): this;
    figure(builder?: (element: ViewElement<FigureElementAttributes>) => void): this;
    font(builder?: (element: ViewElement<FontElementAttributes>) => void): this;
    footer(builder?: (element: ViewElement<FooterElementAttributes>) => void): this;
    form(builder?: (element: ViewElement<FormElementAttributes>) => void): this;
    frame(builder?: (element: ViewElement<FrameElementAttributes>) => void): this;
    frameset(builder?: (element: ViewElement<FramesetElementAttributes>) => void): this;
    h1(builder?: (element: ViewElement<H1ElementAttributes>) => void): this;
    h2(builder?: (element: ViewElement<H2ElementAttributes>) => void): this;
    h3(builder?: (element: ViewElement<H3ElementAttributes>) => void): this;
    h4(builder?: (element: ViewElement<H4ElementAttributes>) => void): this;
    h5(builder?: (element: ViewElement<H5ElementAttributes>) => void): this;
    h6(builder?: (element: ViewElement<H6ElementAttributes>) => void): this;
    head(builder?: (element: ViewElement<HeadElementAttributes>) => void): this;
    header(builder?: (element: ViewElement<HeaderElementAttributes>) => void): this;
    hgroup(builder?: (element: ViewElement<HgroupElementAttributes>) => void): this;
    hr(builder?: (element: ViewElement<HrElementAttributes>) => void): this;
    html(builder?: (element: ViewElement<HtmlElementAttributes>) => void): this;
    i(builder?: (element: ViewElement<IElementAttributes>) => void): this;
    iframe(builder?: (element: ViewElement<IframeElementAttributes>) => void): this;
    image(builder?: (element: ViewElement<ImageElementAttributes>) => void): this;
    img(builder?: (element: ViewElement<ImgElementAttributes>) => void): this;
    input(builder?: (element: ViewElement<InputElementAttributes>) => void): this;
    ins(builder?: (element: ViewElement<InsElementAttributes>) => void): this;
    isindex(builder?: (element: ViewElement<IsindexElementAttributes>) => void): this;
    kbd(builder?: (element: ViewElement<KbdElementAttributes>) => void): this;
    keygen(builder?: (element: ViewElement<KeygenElementAttributes>) => void): this;
    label(builder?: (element: ViewElement<LabelElementAttributes>) => void): this;
    legend(builder?: (element: ViewElement<LegendElementAttributes>) => void): this;
    li(builder?: (element: ViewElement<LiElementAttributes>) => void): this;
    link(builder?: (element: ViewElement<LinkElementAttributes>) => void): this;
    listing(builder?: (element: ViewElement<ListingElementAttributes>) => void): this;
    main(builder?: (element: ViewElement<MainElementAttributes>) => void): this;
    map(builder?: (element: ViewElement<MapElementAttributes>) => void): this;
    mark(builder?: (element: ViewElement<MarkElementAttributes>) => void): this;
    marquee(builder?: (element: ViewElement<MarqueeElementAttributes>) => void): this;
    math(builder?: (element: ViewElement<MathElementAttributes>) => void): this;
    menu(builder?: (element: ViewElement<MenuElementAttributes>) => void): this;
    menuitem(builder?: (element: ViewElement<MenuitemElementAttributes>) => void): this;
    meta(builder?: (element: ViewElement<MetaElementAttributes>) => void): this;
    meter(builder?: (element: ViewElement<MeterElementAttributes>) => void): this;
    multicol(builder?: (element: ViewElement<MulticolElementAttributes>) => void): this;
    nav(builder?: (element: ViewElement<NavElementAttributes>) => void): this;
    nextid(builder?: (element: ViewElement<NextidElementAttributes>) => void): this;
    nobr(builder?: (element: ViewElement<NobrElementAttributes>) => void): this;
    noembed(builder?: (element: ViewElement<NoembedElementAttributes>) => void): this;
    noframes(builder?: (element: ViewElement<NoframesElementAttributes>) => void): this;
    noscript(builder?: (element: ViewElement<NoscriptElementAttributes>) => void): this;
    object(builder?: (element: ViewElement<ObjectElementAttributes>) => void): this;
    ol(builder?: (element: ViewElement<OlElementAttributes>) => void): this;
    optgroup(builder?: (element: ViewElement<OptgroupElementAttributes>) => void): this;
    option(builder?: (element: ViewElement<OptionElementAttributes>) => void): this;
    output(builder?: (element: ViewElement<OutputElementAttributes>) => void): this;
    p(builder?: (element: ViewElement<PElementAttributes>) => void): this;
    param(builder?: (element: ViewElement<ParamElementAttributes>) => void): this;
    picture(builder?: (element: ViewElement<PictureElementAttributes>) => void): this;
    plaintext(builder?: (element: ViewElement<PlaintextElementAttributes>) => void): this;
    pre(builder?: (element: ViewElement<PreElementAttributes>) => void): this;
    progress(builder?: (element: ViewElement<ProgressElementAttributes>) => void): this;
    q(builder?: (element: ViewElement<QElementAttributes>) => void): this;
    rb(builder?: (element: ViewElement<RbElementAttributes>) => void): this;
    rbc(builder?: (element: ViewElement<RbcElementAttributes>) => void): this;
    rp(builder?: (element: ViewElement<RpElementAttributes>) => void): this;
    rt(builder?: (element: ViewElement<RtElementAttributes>) => void): this;
    rtc(builder?: (element: ViewElement<RtcElementAttributes>) => void): this;
    ruby(builder?: (element: ViewElement<RubyElementAttributes>) => void): this;
    s(builder?: (element: ViewElement<SElementAttributes>) => void): this;
    samp(builder?: (element: ViewElement<SampElementAttributes>) => void): this;
    script(builder?: (element: ViewElement<ScriptElementAttributes>) => void): this;
    search(builder?: (element: ViewElement<SearchElementAttributes>) => void): this;
    section(builder?: (element: ViewElement<SectionElementAttributes>) => void): this;
    select(builder?: (element: ViewElement<SelectElementAttributes>) => void): this;
    shadow(builder?: (element: ViewElement<ShadowElementAttributes>) => void): this;
    slot(builder?: (element: ViewElement<SlotElementAttributes>) => void): this;
    small(builder?: (element: ViewElement<SmallElementAttributes>) => void): this;
    source(builder?: (element: ViewElement<SourceElementAttributes>) => void): this;
    spacer(builder?: (element: ViewElement<SpacerElementAttributes>) => void): this;
    span(builder?: (element: ViewElement<SpanElementAttributes>) => void): this;
    strike(builder?: (element: ViewElement<StrikeElementAttributes>) => void): this;
    strong(builder?: (element: ViewElement<StrongElementAttributes>) => void): this;
    style(builder?: (element: ViewElement<StyleElementAttributes>) => void): this;
    sub(builder?: (element: ViewElement<SubElementAttributes>) => void): this;
    summary(builder?: (element: ViewElement<SummaryElementAttributes>) => void): this;
    sup(builder?: (element: ViewElement<SupElementAttributes>) => void): this;
    svg(builder?: (element: ViewElement<SvgElementAttributes>) => void): this;
    table(builder?: (element: ViewElement<TableElementAttributes>) => void): this;
    tbody(builder?: (element: ViewElement<TbodyElementAttributes>) => void): this;
    td(builder?: (element: ViewElement<TdElementAttributes>) => void): this;
    template(builder?: (element: ViewElement<TemplateElementAttributes>) => void): this;
    textarea(builder?: (element: ViewElement<TextareaElementAttributes>) => void): this;
    tfoot(builder?: (element: ViewElement<TfootElementAttributes>) => void): this;
    th(builder?: (element: ViewElement<ThElementAttributes>) => void): this;
    thead(builder?: (element: ViewElement<TheadElementAttributes>) => void): this;
    time(builder?: (element: ViewElement<TimeElementAttributes>) => void): this;
    title(builder?: (element: ViewElement<TitleElementAttributes>) => void): this;
    tr(builder?: (element: ViewElement<TrElementAttributes>) => void): this;
    track(builder?: (element: ViewElement<TrackElementAttributes>) => void): this;
    tt(builder?: (element: ViewElement<TtElementAttributes>) => void): this;
    u(builder?: (element: ViewElement<UElementAttributes>) => void): this;
    ul(builder?: (element: ViewElement<UlElementAttributes>) => void): this;
    var(builder?: (element: ViewElement<VarElementAttributes>) => void): this;
    video(builder?: (element: ViewElement<VideoElementAttributes>) => void): this;
    wbr(builder?: (element: ViewElement<WbrElementAttributes>) => void): this;
    xmp(builder?: (element: ViewElement<XmpElementAttributes>) => void): this;
}

export interface AElementAttributes extends SpecialAttributes, GlobalAttributes {
    charset(value: string): AElementAttributes;
    coords(value: string): AElementAttributes;
    download(value: string): AElementAttributes;
    href(value: string): AElementAttributes;
    hreflang(value: string): AElementAttributes;
    name(value: string): AElementAttributes;
    ping(value: string): AElementAttributes;
    referrerpolicy(value: string): AElementAttributes;
    rel(value: string): AElementAttributes;
    rev(value: string): AElementAttributes;
    shape(value: string): AElementAttributes;
    target(value: string): AElementAttributes;
    type(value: string): AElementAttributes;
}

export interface AbbrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AcronymElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AddressElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AppletElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): AppletElementAttributes;
    alt(value: string): AppletElementAttributes;
    archive(value: string): AppletElementAttributes;
    code(value: string): AppletElementAttributes;
    codebase(value: string): AppletElementAttributes;
    height(value: string): AppletElementAttributes;
    hspace(value: string): AppletElementAttributes;
    name(value: string): AppletElementAttributes;
    object(value: string): AppletElementAttributes;
    vspace(value: string): AppletElementAttributes;
    width(value: string): AppletElementAttributes;
}

export interface AreaElementAttributes extends SpecialAttributes, GlobalAttributes {
    alt(value: string): AreaElementAttributes;
    coords(value: string): AreaElementAttributes;
    download(value: string): AreaElementAttributes;
    href(value: string): AreaElementAttributes;
    hreflang(value: string): AreaElementAttributes;
    nohref(value: string): AreaElementAttributes;
    ping(value: string): AreaElementAttributes;
    referrerpolicy(value: string): AreaElementAttributes;
    rel(value: string): AreaElementAttributes;
    shape(value: string): AreaElementAttributes;
    target(value: string): AreaElementAttributes;
    type(value: string): AreaElementAttributes;
}

export interface ArticleElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AsideElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AudioElementAttributes extends SpecialAttributes, GlobalAttributes {
    autoplay(value: boolean): AudioElementAttributes;
    controls(value: boolean): AudioElementAttributes;
    crossorigin(value: string): AudioElementAttributes;
    loop(value: boolean): AudioElementAttributes;
    muted(value: boolean): AudioElementAttributes;
    preload(value: string): AudioElementAttributes;
    src(value: string): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BaseElementAttributes extends SpecialAttributes, GlobalAttributes {
    href(value: string): BaseElementAttributes;
    target(value: string): BaseElementAttributes;
}

export interface BasefontElementAttributes extends SpecialAttributes, GlobalAttributes {
    color(value: string): BasefontElementAttributes;
    face(value: string): BasefontElementAttributes;
    size(value: string): BasefontElementAttributes;
}

export interface BdiElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BdoElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BgsoundElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BigElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BlinkElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BlockquoteElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialAttributes, GlobalAttributes {
    alink(value: string): BodyElementAttributes;
    background(value: string): BodyElementAttributes;
    bgcolor(value: string): BodyElementAttributes;
    link(value: string): BodyElementAttributes;
    text(value: string): BodyElementAttributes;
    vlink(value: string): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialAttributes, GlobalAttributes {
    clear(value: string): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean): ButtonElementAttributes;
    form(value: string): ButtonElementAttributes;
    formaction(value: string): ButtonElementAttributes;
    formenctype(value: string): ButtonElementAttributes;
    formmethod(value: string): ButtonElementAttributes;
    formnovalidate(value: boolean): ButtonElementAttributes;
    formtarget(value: string): ButtonElementAttributes;
    name(value: string): ButtonElementAttributes;
    popovertarget(value: string): ButtonElementAttributes;
    popovertargetaction(value: string): ButtonElementAttributes;
    type(value: string): ButtonElementAttributes;
    value(value: string): ButtonElementAttributes;
}

export interface CanvasElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string): CanvasElementAttributes;
    width(value: string): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): CaptionElementAttributes;
}

export interface CenterElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface CiteElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface CodeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ColElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): ColElementAttributes;
    char(value: string): ColElementAttributes;
    charoff(value: string): ColElementAttributes;
    span(value: string): ColElementAttributes;
    valign(value: string): ColElementAttributes;
    width(value: string): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): ColgroupElementAttributes;
    char(value: string): ColgroupElementAttributes;
    charoff(value: string): ColgroupElementAttributes;
    span(value: string): ColgroupElementAttributes;
    valign(value: string): ColgroupElementAttributes;
    width(value: string): ColgroupElementAttributes;
}

export interface CommandElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ContentElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DataElementAttributes extends SpecialAttributes, GlobalAttributes {
    value(value: string): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DdElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DelElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string): DelElementAttributes;
    datetime(value: string): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialAttributes, GlobalAttributes {
    open(value: boolean): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DialogElementAttributes extends SpecialAttributes, GlobalAttributes {
    open(value: boolean): DialogElementAttributes;
}

export interface DirElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string): DirElementAttributes;
}

export interface DivElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ElementElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface EmElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface EmbedElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string): EmbedElementAttributes;
    src(value: string): EmbedElementAttributes;
    type(value: string): EmbedElementAttributes;
    width(value: string): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean): FieldsetElementAttributes;
    form(value: string): FieldsetElementAttributes;
    name(value: string): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FigureElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FontElementAttributes extends SpecialAttributes, GlobalAttributes {
    color(value: string): FontElementAttributes;
    face(value: string): FontElementAttributes;
    size(value: string): FontElementAttributes;
}

export interface FooterElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FormElementAttributes extends SpecialAttributes, GlobalAttributes {
    accept(value: string): FormElementAttributes;
    acceptCharset(value: string): FormElementAttributes;
    action(value: string): FormElementAttributes;
    autocomplete(value: string): FormElementAttributes;
    enctype(value: string): FormElementAttributes;
    method(value: string): FormElementAttributes;
    name(value: string): FormElementAttributes;
    novalidate(value: boolean): FormElementAttributes;
    target(value: string): FormElementAttributes;
}

export interface FrameElementAttributes extends SpecialAttributes, GlobalAttributes {
    frameborder(value: string): FrameElementAttributes;
    longdesc(value: string): FrameElementAttributes;
    marginheight(value: string): FrameElementAttributes;
    marginwidth(value: string): FrameElementAttributes;
    name(value: string): FrameElementAttributes;
    noresize(value: string): FrameElementAttributes;
    scrolling(value: string): FrameElementAttributes;
    src(value: string): FrameElementAttributes;
}

export interface FramesetElementAttributes extends SpecialAttributes, GlobalAttributes {
    cols(value: string): FramesetElementAttributes;
    rows(value: string): FramesetElementAttributes;
}

export interface H1ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialAttributes, GlobalAttributes {
    profile(value: string): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface HgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface HrElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): HrElementAttributes;
    noshade(value: string): HrElementAttributes;
    size(value: string): HrElementAttributes;
    width(value: string): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialAttributes, GlobalAttributes {
    manifest(value: string): HtmlElementAttributes;
    version(value: string): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface IframeElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): IframeElementAttributes;
    allow(value: string): IframeElementAttributes;
    allowfullscreen(value: boolean): IframeElementAttributes;
    allowpaymentrequest(value: string): IframeElementAttributes;
    allowusermedia(value: string): IframeElementAttributes;
    frameborder(value: string): IframeElementAttributes;
    height(value: string): IframeElementAttributes;
    loading(value: string): IframeElementAttributes;
    longdesc(value: string): IframeElementAttributes;
    marginheight(value: string): IframeElementAttributes;
    marginwidth(value: string): IframeElementAttributes;
    name(value: string): IframeElementAttributes;
    referrerpolicy(value: string): IframeElementAttributes;
    sandbox(value: string): IframeElementAttributes;
    scrolling(value: string): IframeElementAttributes;
    src(value: string): IframeElementAttributes;
    srcdoc(value: string): IframeElementAttributes;
    width(value: string): IframeElementAttributes;
}

export interface ImageElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ImgElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): ImgElementAttributes;
    alt(value: string): ImgElementAttributes;
    border(value: string): ImgElementAttributes;
    crossorigin(value: string): ImgElementAttributes;
    decoding(value: string): ImgElementAttributes;
    fetchpriority(value: string): ImgElementAttributes;
    height(value: string): ImgElementAttributes;
    hspace(value: string): ImgElementAttributes;
    ismap(value: boolean): ImgElementAttributes;
    loading(value: string): ImgElementAttributes;
    longdesc(value: string): ImgElementAttributes;
    name(value: string): ImgElementAttributes;
    referrerpolicy(value: string): ImgElementAttributes;
    sizes(value: string): ImgElementAttributes;
    src(value: string): ImgElementAttributes;
    srcset(value: string): ImgElementAttributes;
    usemap(value: string): ImgElementAttributes;
    vspace(value: string): ImgElementAttributes;
    width(value: string): ImgElementAttributes;
}

export interface InputElementAttributes extends SpecialAttributes, GlobalAttributes {
    accept(value: string): InputElementAttributes;
    align(value: string): InputElementAttributes;
    alt(value: string): InputElementAttributes;
    autocomplete(value: string): InputElementAttributes;
    checked(value: boolean): InputElementAttributes;
    dirname(value: string): InputElementAttributes;
    disabled(value: boolean): InputElementAttributes;
    form(value: string): InputElementAttributes;
    formaction(value: string): InputElementAttributes;
    formenctype(value: string): InputElementAttributes;
    formmethod(value: string): InputElementAttributes;
    formnovalidate(value: boolean): InputElementAttributes;
    formtarget(value: string): InputElementAttributes;
    height(value: string): InputElementAttributes;
    ismap(value: boolean): InputElementAttributes;
    list(value: string): InputElementAttributes;
    max(value: string): InputElementAttributes;
    maxlength(value: string): InputElementAttributes;
    min(value: string): InputElementAttributes;
    minlength(value: string): InputElementAttributes;
    multiple(value: boolean): InputElementAttributes;
    name(value: string): InputElementAttributes;
    pattern(value: string): InputElementAttributes;
    placeholder(value: string): InputElementAttributes;
    popovertarget(value: string): InputElementAttributes;
    popovertargetaction(value: string): InputElementAttributes;
    readonly(value: boolean): InputElementAttributes;
    required(value: boolean): InputElementAttributes;
    size(value: string): InputElementAttributes;
    src(value: string): InputElementAttributes;
    step(value: string): InputElementAttributes;
    type(value: string): InputElementAttributes;
    usemap(value: string): InputElementAttributes;
    value(value: string): InputElementAttributes;
    width(value: string): InputElementAttributes;
}

export interface InsElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string): InsElementAttributes;
    datetime(value: string): InsElementAttributes;
}

export interface IsindexElementAttributes extends SpecialAttributes, GlobalAttributes {
    prompt(value: string): IsindexElementAttributes;
}

export interface KbdElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface KeygenElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface LabelElementAttributes extends SpecialAttributes, GlobalAttributes {
    for(value: string): LabelElementAttributes;
    form(value: string): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialAttributes, GlobalAttributes {
    type(value: string): LiElementAttributes;
    value(value: string): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialAttributes, GlobalAttributes {
    as(value: string): LinkElementAttributes;
    blocking(value: string): LinkElementAttributes;
    charset(value: string): LinkElementAttributes;
    color(value: string): LinkElementAttributes;
    crossorigin(value: string): LinkElementAttributes;
    disabled(value: boolean): LinkElementAttributes;
    fetchpriority(value: string): LinkElementAttributes;
    href(value: string): LinkElementAttributes;
    hreflang(value: string): LinkElementAttributes;
    imagesizes(value: string): LinkElementAttributes;
    imagesrcset(value: string): LinkElementAttributes;
    integrity(value: string): LinkElementAttributes;
    media(value: string): LinkElementAttributes;
    referrerpolicy(value: string): LinkElementAttributes;
    rel(value: string): LinkElementAttributes;
    rev(value: string): LinkElementAttributes;
    sizes(value: string): LinkElementAttributes;
    target(value: string): LinkElementAttributes;
    type(value: string): LinkElementAttributes;
}

export interface ListingElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MainElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MapElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MarqueeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MathElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MenuElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MetaElementAttributes extends SpecialAttributes, GlobalAttributes {
    charset(value: string): MetaElementAttributes;
    content(value: string): MetaElementAttributes;
    httpEquiv(value: string): MetaElementAttributes;
    media(value: string): MetaElementAttributes;
    name(value: string): MetaElementAttributes;
    scheme(value: string): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialAttributes, GlobalAttributes {
    high(value: string): MeterElementAttributes;
    low(value: string): MeterElementAttributes;
    max(value: string): MeterElementAttributes;
    min(value: string): MeterElementAttributes;
    optimum(value: string): MeterElementAttributes;
    value(value: string): MeterElementAttributes;
}

export interface MulticolElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NavElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NextidElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NobrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoembedElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoframesElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoscriptElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ObjectElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): ObjectElementAttributes;
    archive(value: string): ObjectElementAttributes;
    border(value: string): ObjectElementAttributes;
    classid(value: string): ObjectElementAttributes;
    codebase(value: string): ObjectElementAttributes;
    codetype(value: string): ObjectElementAttributes;
    data(value: string): ObjectElementAttributes;
    declare(value: string): ObjectElementAttributes;
    form(value: string): ObjectElementAttributes;
    height(value: string): ObjectElementAttributes;
    hspace(value: string): ObjectElementAttributes;
    name(value: string): ObjectElementAttributes;
    standby(value: string): ObjectElementAttributes;
    type(value: string): ObjectElementAttributes;
    typemustmatch(value: string): ObjectElementAttributes;
    usemap(value: string): ObjectElementAttributes;
    vspace(value: string): ObjectElementAttributes;
    width(value: string): ObjectElementAttributes;
}

export interface OlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string): OlElementAttributes;
    reversed(value: boolean): OlElementAttributes;
    start(value: string): OlElementAttributes;
    type(value: string): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean): OptgroupElementAttributes;
    label(value: string): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean): OptionElementAttributes;
    label(value: string): OptionElementAttributes;
    selected(value: boolean): OptionElementAttributes;
    value(value: string): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialAttributes, GlobalAttributes {
    for(value: string): OutputElementAttributes;
    form(value: string): OutputElementAttributes;
    name(value: string): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string): ParamElementAttributes;
    type(value: string): ParamElementAttributes;
    value(value: string): ParamElementAttributes;
    valuetype(value: string): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface PlaintextElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface PreElementAttributes extends SpecialAttributes, GlobalAttributes {
    width(value: string): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialAttributes, GlobalAttributes {
    max(value: string): ProgressElementAttributes;
    value(value: string): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string): QElementAttributes;
}

export interface RbElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RbcElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RpElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RtcElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RubyElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SampElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ScriptElementAttributes extends SpecialAttributes, GlobalAttributes {
    async(value: boolean): ScriptElementAttributes;
    blocking(value: string): ScriptElementAttributes;
    charset(value: string): ScriptElementAttributes;
    crossorigin(value: string): ScriptElementAttributes;
    defer(value: boolean): ScriptElementAttributes;
    fetchpriority(value: string): ScriptElementAttributes;
    integrity(value: string): ScriptElementAttributes;
    language(value: string): ScriptElementAttributes;
    nomodule(value: boolean): ScriptElementAttributes;
    referrerpolicy(value: string): ScriptElementAttributes;
    src(value: string): ScriptElementAttributes;
    type(value: string): ScriptElementAttributes;
}

export interface SearchElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SectionElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SelectElementAttributes extends SpecialAttributes, GlobalAttributes {
    autocomplete(value: string): SelectElementAttributes;
    disabled(value: boolean): SelectElementAttributes;
    form(value: string): SelectElementAttributes;
    multiple(value: boolean): SelectElementAttributes;
    name(value: string): SelectElementAttributes;
    required(value: boolean): SelectElementAttributes;
    size(value: string): SelectElementAttributes;
}

export interface ShadowElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SlotElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SourceElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string): SourceElementAttributes;
    media(value: string): SourceElementAttributes;
    sizes(value: string): SourceElementAttributes;
    src(value: string): SourceElementAttributes;
    srcset(value: string): SourceElementAttributes;
    type(value: string): SourceElementAttributes;
    width(value: string): SourceElementAttributes;
}

export interface SpacerElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SpanElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StrikeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StrongElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StyleElementAttributes extends SpecialAttributes, GlobalAttributes {
    blocking(value: string): StyleElementAttributes;
    media(value: string): StyleElementAttributes;
    type(value: string): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SummaryElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SupElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SvgElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TableElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): TableElementAttributes;
    bgcolor(value: string): TableElementAttributes;
    border(value: string): TableElementAttributes;
    cellpadding(value: string): TableElementAttributes;
    cellspacing(value: string): TableElementAttributes;
    frame(value: string): TableElementAttributes;
    rules(value: string): TableElementAttributes;
    summary(value: string): TableElementAttributes;
    width(value: string): TableElementAttributes;
}

export interface TbodyElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): TbodyElementAttributes;
    char(value: string): TbodyElementAttributes;
    charoff(value: string): TbodyElementAttributes;
    valign(value: string): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialAttributes, GlobalAttributes {
    abbr(value: string): TdElementAttributes;
    align(value: string): TdElementAttributes;
    axis(value: string): TdElementAttributes;
    bgcolor(value: string): TdElementAttributes;
    char(value: string): TdElementAttributes;
    charoff(value: string): TdElementAttributes;
    colspan(value: string): TdElementAttributes;
    headers(value: string): TdElementAttributes;
    height(value: string): TdElementAttributes;
    nowrap(value: string): TdElementAttributes;
    rowspan(value: string): TdElementAttributes;
    scope(value: string): TdElementAttributes;
    valign(value: string): TdElementAttributes;
    width(value: string): TdElementAttributes;
}

export interface TemplateElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TextareaElementAttributes extends SpecialAttributes, GlobalAttributes {
    autocomplete(value: string): TextareaElementAttributes;
    cols(value: string): TextareaElementAttributes;
    dirname(value: string): TextareaElementAttributes;
    disabled(value: boolean): TextareaElementAttributes;
    form(value: string): TextareaElementAttributes;
    maxlength(value: string): TextareaElementAttributes;
    minlength(value: string): TextareaElementAttributes;
    name(value: string): TextareaElementAttributes;
    placeholder(value: string): TextareaElementAttributes;
    readonly(value: boolean): TextareaElementAttributes;
    required(value: boolean): TextareaElementAttributes;
    rows(value: string): TextareaElementAttributes;
    wrap(value: string): TextareaElementAttributes;
}

export interface TfootElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): TfootElementAttributes;
    char(value: string): TfootElementAttributes;
    charoff(value: string): TfootElementAttributes;
    valign(value: string): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialAttributes, GlobalAttributes {
    abbr(value: string): ThElementAttributes;
    align(value: string): ThElementAttributes;
    axis(value: string): ThElementAttributes;
    bgcolor(value: string): ThElementAttributes;
    char(value: string): ThElementAttributes;
    charoff(value: string): ThElementAttributes;
    colspan(value: string): ThElementAttributes;
    headers(value: string): ThElementAttributes;
    height(value: string): ThElementAttributes;
    nowrap(value: string): ThElementAttributes;
    rowspan(value: string): ThElementAttributes;
    scope(value: string): ThElementAttributes;
    valign(value: string): ThElementAttributes;
    width(value: string): ThElementAttributes;
}

export interface TheadElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): TheadElementAttributes;
    char(value: string): TheadElementAttributes;
    charoff(value: string): TheadElementAttributes;
    valign(value: string): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialAttributes, GlobalAttributes {
    datetime(value: string): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TrElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string): TrElementAttributes;
    bgcolor(value: string): TrElementAttributes;
    char(value: string): TrElementAttributes;
    charoff(value: string): TrElementAttributes;
    valign(value: string): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialAttributes, GlobalAttributes {
    default(value: boolean): TrackElementAttributes;
    kind(value: string): TrackElementAttributes;
    label(value: string): TrackElementAttributes;
    src(value: string): TrackElementAttributes;
    srclang(value: string): TrackElementAttributes;
}

export interface TtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface UElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface UlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string): UlElementAttributes;
    type(value: string): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface VideoElementAttributes extends SpecialAttributes, GlobalAttributes {
    autoplay(value: boolean): VideoElementAttributes;
    controls(value: boolean): VideoElementAttributes;
    crossorigin(value: string): VideoElementAttributes;
    height(value: string): VideoElementAttributes;
    loop(value: boolean): VideoElementAttributes;
    muted(value: boolean): VideoElementAttributes;
    playsinline(value: boolean): VideoElementAttributes;
    poster(value: string): VideoElementAttributes;
    preload(value: string): VideoElementAttributes;
    src(value: string): VideoElementAttributes;
    width(value: string): VideoElementAttributes;
}

export interface WbrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface XmpElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export const booleanAttributes: Set<string> = new Set();
booleanAttributes.add("allowfullscreen")
booleanAttributes.add("async")
booleanAttributes.add("autofocus")
booleanAttributes.add("autoplay")
booleanAttributes.add("checked")
booleanAttributes.add("controls")
booleanAttributes.add("default")
booleanAttributes.add("defer")
booleanAttributes.add("disabled")
booleanAttributes.add("formnovalidate")
booleanAttributes.add("inert")
booleanAttributes.add("ismap")
booleanAttributes.add("itemscope")
booleanAttributes.add("loop")
booleanAttributes.add("multiple")
booleanAttributes.add("muted")
booleanAttributes.add("nomodule")
booleanAttributes.add("novalidate")
booleanAttributes.add("open")
booleanAttributes.add("playsinline")
booleanAttributes.add("readonly")
booleanAttributes.add("required")
booleanAttributes.add("reversed")
booleanAttributes.add("selected")
